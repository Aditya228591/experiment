"""MicroSLM: Pure PyTorch Lightweight Transformer Language Model for local edge deployment."""

import json
import math
from typing import Dict, List, Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F


class CharacterSubwordTokenizer:
    """Fast, robust byte/character tokenizer with special tokens."""

    PAD_TOKEN = "<pad>"
    UNK_TOKEN = "<unk>"
    BOS_TOKEN = "<bos>"
    EOS_TOKEN = "<eos>"
    SEP_TOKEN = "<sep>"

    def __init__(self, vocab: Optional[Dict[str, int]] = None):
        if vocab:
            self.token_to_id = vocab
            self.id_to_token = {v: k for k, v in vocab.items()}
        else:
            self.token_to_id: Dict[str, int] = {}
            self.id_to_token: Dict[int, str] = {}
            self._init_special_tokens()

    def _init_special_tokens(self):
        for token in [self.PAD_TOKEN, self.UNK_TOKEN, self.BOS_TOKEN, self.EOS_TOKEN, self.SEP_TOKEN]:
            self.add_token(token)

    def add_token(self, token: str) -> int:
        if token not in self.token_to_id:
            idx = len(self.token_to_id)
            self.token_to_id[token] = idx
            self.id_to_token[idx] = token
            return idx
        return self.token_to_id[token]

    def fit_on_texts(self, texts: List[str], max_vocab_size: int = 512):
        """Build vocabulary from corpus."""
        freq: Dict[str, int] = {}
        for text in texts:
            for char in text:
                freq[char] = freq.get(char, 0) + 1

        # Also add common subword bigrams to improve compression
        for text in texts:
            words = text.split()
            for word in words:
                if len(word) >= 2 and len(word) <= 6:
                    freq[word] = freq.get(word, 0) + 1

        sorted_tokens = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        limit = max_vocab_size - len(self.token_to_id)
        for token, _ in sorted_tokens[:limit]:
            self.add_token(token)

    def encode(self, text: str, add_special_tokens: bool = True) -> List[int]:
        """Encode string into token IDs."""
        tokens: List[int] = []
        if add_special_tokens:
            tokens.append(self.token_to_id[self.BOS_TOKEN])

        i = 0
        n = len(text)
        unk_id = self.token_to_id[self.UNK_TOKEN]
        while i < n:
            # Try matching longest known token (up to 6 chars)
            matched = False
            for length in range(min(6, n - i), 1, -1):
                chunk = text[i : i + length]
                if chunk in self.token_to_id:
                    tokens.append(self.token_to_id[chunk])
                    i += length
                    matched = True
                    break
            if not matched:
                char = text[i]
                tokens.append(self.token_to_id.get(char, unk_id))
                i += 1

        if add_special_tokens:
            tokens.append(self.token_to_id[self.EOS_TOKEN])
        return tokens

    def decode(self, token_ids: List[int], skip_special_tokens: bool = True) -> str:
        """Decode token IDs back to string."""
        specials = {self.PAD_TOKEN, self.UNK_TOKEN, self.BOS_TOKEN, self.EOS_TOKEN, self.SEP_TOKEN}
        result = []
        for tid in token_ids:
            tok = self.id_to_token.get(tid, "")
            if skip_special_tokens and tok in specials:
                continue
            result.append(tok)
        return "".join(result)

    @property
    def vocab_size(self) -> int:
        return len(self.token_to_id)

    def to_dict(self) -> Dict[str, int]:
        return self.token_to_id

    @classmethod
    def from_dict(cls, data: Dict[str, int]):
        return cls(vocab=data)


class TransformerBlock(nn.Module):
    """Causal Transformer Decoder Layer with LayerNorm and FeedForward."""

    def __init__(self, d_model: int, n_heads: int, dim_feedforward: int, dropout: float = 0.1):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads

        assert d_model % n_heads == 0, "d_model must be divisible by n_heads"

        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)

        self.ln1 = nn.LayerNorm(d_model)
        self.ln2 = nn.LayerNorm(d_model)

        self.ffn = nn.Sequential(
            nn.Linear(d_model, dim_feedforward),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(dim_feedforward, d_model),
            nn.Dropout(dropout),
        )

    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        # Pre-LN Causal Self-Attention
        norm_x = self.ln1(x)
        b, seq_len, _ = norm_x.shape

        q = self.q_proj(norm_x).view(b, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(norm_x).view(b, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(norm_x).view(b, seq_len, self.n_heads, self.head_dim).transpose(1, 2)

        # PyTorch 2.0+ optimized scaled dot product attention
        attn_out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        attn_out = attn_out.transpose(1, 2).contiguous().view(b, seq_len, self.d_model)
        x = x + self.out_proj(attn_out)

        # Pre-LN Feed-Forward
        x = x + self.ffn(self.ln2(x))
        return x


class MicroSLM(nn.Module):
    """Standalone compact Small Language Model built for task-specific automation."""

    def __init__(
        self,
        vocab_size: int,
        d_model: int = 128,
        n_heads: int = 4,
        n_layers: int = 3,
        dim_feedforward: int = 512,
        max_seq_len: int = 128,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.config = {
            "vocab_size": vocab_size,
            "d_model": d_model,
            "n_heads": n_heads,
            "n_layers": n_layers,
            "dim_feedforward": dim_feedforward,
            "max_seq_len": max_seq_len,
            "dropout": dropout,
        }

        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.pos_embedding = nn.Embedding(max_seq_len, d_model)
        self.drop = nn.Dropout(dropout)

        self.layers = nn.ModuleList([
            TransformerBlock(d_model, n_heads, dim_feedforward, dropout)
            for _ in range(n_layers)
        ])

        self.ln_f = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)

        # Weight tying between token embedding and LM head for parameter efficiency
        self.lm_head.weight = self.token_embedding.weight

        self.apply(self._init_weights)

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def count_parameters(self) -> int:
        """Return total trainable parameters."""
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def forward(
        self,
        input_ids: torch.Tensor,
        targets: Optional[torch.Tensor] = None,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        b, seq_len = input_ids.shape
        device = input_ids.device

        positions = torch.arange(0, seq_len, dtype=torch.long, device=device).unsqueeze(0)
        x = self.token_embedding(input_ids) + self.pos_embedding(positions)
        x = self.drop(x)

        for layer in self.layers:
            x = layer(x)

        x = self.ln_f(x)
        logits = self.lm_head(x)

        loss = None
        if targets is not None:
            # Shift targets for next-token prediction
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),
                targets.view(-1),
                ignore_index=0,  # Pad token index
            )

        return logits, loss

    @torch.no_grad()
    def generate(
        self,
        input_ids: torch.Tensor,
        max_new_tokens: int = 64,
        temperature: float = 0.7,
        top_k: int = 40,
        eos_token_id: Optional[int] = None,
    ) -> torch.Tensor:
        """Autoregressive text generation with temperature and top-k filtering."""
        self.eval()
        for _ in range(max_new_tokens):
            idx_cond = input_ids if input_ids.size(1) <= self.config["max_seq_len"] else input_ids[:, -self.config["max_seq_len"]:]
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :] / max(temperature, 1e-5)

            if top_k > 0:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, [-1]]] = -float("Inf")

            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            input_ids = torch.cat((input_ids, next_token), dim=1)

            if eos_token_id is not None and next_token.item() == eos_token_id:
                break

        return input_ids
