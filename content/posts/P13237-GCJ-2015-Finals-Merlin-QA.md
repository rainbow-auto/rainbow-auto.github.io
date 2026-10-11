---
title: P13237 [GCJ 2015 Finals] Merlin QA
date: 2025-10-01 19:29:53
tags:
---

这个题面写的真的不太像是人话。

## 简要题意

有一个 $m$ 维向量 $\vec{a} = (a_1, \ldots, a_m)$，开始时 $a = \vec{0}$。

有 $n$ 次操作，你可以任意决定她们的顺序。每个操作可表示为一个 $m$ 维向量 $\vec{b} = (b_1, \ldots, b_m)$，操作为将 $\vec{a}$ 变为 $\vec{a} + \vec{b}$，并且每一维对 $0$ 取 $\max$。

最大化 $n$ 次操作后的 $\sum a_i$。

## Sol

考虑对 $0$ 取 $\max$ 的性质，对于每一维，能够向答案做出贡献的一定是一个后缀。

并且显然是最大的一个后缀。

因而我们只需要保证去到的是一个后缀就可以使得我们的构造不优于正确答案。即我们不会统计到非法的情况。

我们反过来考虑每一个操作对答案产生的贡献。我们发现每个操作中的

```cpp
constexpr int maxm = 10;
constexpr int maxn = 105;

int n, m;
int a[maxn][maxm];

int p[maxm];

int T;

void solve() {
	std::cin >> n >> m;
	rep (i, 1, n) rep (j, 1, m) std::cin >> a[i][j];

	rep (i, 1, m) p[i] = i;

	int ans = 0;
	do {
		int ansnow = 0;
		rep (i, 1, n) {
			int cur = 0;
			int mx = 0;
			rep (j, 1, m) {
				cur += a[i][p[j]];
				mx = std::max(mx, cur);
			}
			ansnow += mx;
		}
		ans = std::max(ans, ansnow);
	} while (std::next_permutation(p + 1, p + m + 1));

	std::cout << "Case #" << (++T) << ": " << ans << "\n";
}
```