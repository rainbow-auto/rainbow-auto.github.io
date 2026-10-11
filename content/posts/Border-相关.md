---
title: kmp & Border 相关
date: 2025-05-03 19:34:06
tags:
---

## 写在前面

一直想写一个 Border 相关的文章。

网上 kmp 相关的文章都好唐啊，全是半懂不懂的人在随机说话。符号系统混乱，逻辑错误百出，还没有任何深刻的理解。

忍不了一点。

感觉越基础的算法越难自学，因为网络上基础算法的 blog 质量都比较差。高水平选手不屑于写这些基础算法的 blog，而低水平选手写出来的 blog 往往质量很差。

## 记号 & 约定

- $S$ 的长度为 $\left\lvert S \right\rvert$
- $S[i]$ 为 $S$ 的第 $i$ 个字符
- $S[l \ldots r]$ 为由 $S$ 的第 $l$ 个字符到第 $r$ 个字符组成的字串。
- $S[1 \ldots k]$ 称为 $S$ 的长为 $k$ 的前缀，简写为 $\operatorname{pre}_S(k)$。 在意义明确的情况下，可简写为 $\operatorname{pre}(k)$

- $S[\left\lvert S \right\rvert - k + 1, \left\lvert S \right\rvert]$ 称为 $S$ 的长为 $k$ 的后缀，简写为 $\operatorname{suf}_S(k)$ 或 $\operatorname{suf}(k)$

## 定义和简单性质

对于字符串 $S$，若 $k$ 满足 $\operatorname{pre}(k)$ 与 $\operatorname{suf}(k)$ 相等，则称 $\operatorname{pre}(k)$ 为 $S$ 的一个长为 $k$ 的 $\operatorname{Border}$。显然 $\left\lvert S \right\rvert$ 是极大的 $\operatorname{Border}$，不过她实在太平凡了，下面我们讨论的都是除去她的“真 $\operatorname{Border}$ ”

记 $\operatorname{Border}$ 的集合 $\operatorname{Border}(S) = \{k | k \neq \left\lvert S \right\rvert, \operatorname{pre}_S(k) = \operatorname{suf}_S(k) \}$。

一个重要的性质：

> $\operatorname{Border}$ 的 $\operatorname{Border}$ 还是 $\operatorname{Border}$。

取 $p, q \in \operatorname{Border}(S)$，不妨设 $p < q$。

记 $\operatorname{pre}_S(p) = \operatorname{suf}_S(p) = P$，$\operatorname{pre}_S(q) = \operatorname{suf}_S(q) = Q$。

由于 $p < q$，则 $\operatorname{pre}_S(p)$ 为 $\operatorname{pre}_S(q)$ 的前缀，即 $P$ 为 $Q$ 的前缀。

同理，$\operatorname{suf}_S(p)$ 为 $\operatorname{suf}_S(q)$ 的后缀，即 $P$ 为 $Q$ 的后缀。

综上，$P$ 既是 $Q$ 的前缀，又是 $Q$ 的后缀，即 $P$ 为 $Q$ 的一个 $\operatorname{Border}$，$p \in \operatorname{Border}(Q)$。

## 预处理

考虑如何求出 $S$ 的所有 $\operatorname{Border}$。

不妨设 $\pi(S)$ 为 $\operatorname{Border}(S)$ 中的极大元。

则对 $\forall p \in \operatorname{Border}(S)$ 且 $p \neq \pi(S)$，$p$ 都是 $\operatorname{pre}(\pi(S))$ 的 $\operatorname{Border}$。

注意到，我们把现在把求 $S$ 的 $\operatorname{Border}$ 转化为了求 $S$ 的长度为 $pi(S)$ 的前缀的 $\operatorname{Border}$。

对于每一个前缀，如果我们都知道她的 $\pi$ 函数值，获得所有的 $\operatorname{Border}$ 将是轻松的。

考虑增量构建。显然 $\pi_1 = 0$。

设已知 $\pi_{1 \ldots k}$ 的值，新加入的字符 $S_{k + 1}$ 为 $c$。

那么相较于 $\operatorname{pre}(k)$，$\operatorname{pre}(k + 1)$ 中的每个后缀都增加了 $c$。因此如果 $pre(k)$ 的一个长为 $p$ 的 $\operatorname{Border}$ 满足 $S_{p + 1} = c$，则 $p$ 也是 $\operatorname{pre(k + 1)}$ 的 $\operatorname{Border}$。

那么一个 trivial 的实现方法就是暴力遍历 $\operatorname{pre}(k)$ 的所有 $\operatorname{Border}$，然后找到满足上述条件的最大 $p$，此时有 $\pi_{k + 1} = p$。

同时，按照每次取出 $\operatorname{Border}$ 中的极大元的方法遍历的 $\operatorname{Border}$ 是从大到小的，第一次遍历的到合法的 $p$ 就恰好是 $\pi_{k + 1}$ 的值。  

### 复杂度分析

考虑一个势能函数 $\varphi$，当前尝试匹配的位置。

匹配上合法的一个 $p$ 能够使得 $\varphi$ 变大 $1$，称这种操作为 $A$ 操作。 

不能够匹配合法的 $p$ 会使得 $\varphi$ 变小，称这种操作为 $B$ 操作。

显然在全过程中 $\varphi$ 始终非负，因而 $T(B) \leq T(B)$, 即使 $\varphi$ 变小的总次数不超过使 $\varphi$ 变大 $1$ 的次数。

又因为每次操作都为 $O(1)$，$T(A) = O(n)$, 所以 $T(A + B) = T(A) + T(B) = O(n)$。

### 代码实现

```cpp
inline std::vector<int> get_pi(const std::string &s) {
    std::vector<int> pi(s.length());

    rep (i, 2, (int) s.length() - 1) {
        int j = pi[i - 1];
        while (j and s[j + 1] != s[i]) j = pi[j];
        if (s[j + 1] == s[i]) j++;
        pi[i] = j;
    }

    return pi;
}
```

## *$\operatorname{Border}$ 的结构

前文提到，

> $\operatorname{Border}$ 的 $\operatorname{Border}$ 还是 $\operatorname{Border}$。

这样的性质使得 $\operatorname{Border}$ 的结构是树状的。在算法竞赛中，这棵树被称作 $\operatorname{fail}$ 树。

具体地，连边 $k \to \pi_k$。在这样得到的结构中，从 $k$ 到根 $0$ 的路径恰好为 $\operatorname{pre}_S(k)$ 的所有 $\operatorname{Border}$。

这启示我们和 $\operatorname{Border}$ 相关的统计可以转化为树上路径统计。