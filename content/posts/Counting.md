---
title: Counting
date: 2024-09-09 11:29:33
tags: 
    - OI
    - 数数
---

## 拆贡献

### 小怪兽

[Link](https://mna.wang/contest/1212/problem/2)

考虑把被攻击的期望, 拆成每个产生攻击的概率

(因为每个小怪兽至多有 $1$ 的贡献)

### \[JSOI2015\] 子集选取

[Link](https://www.luogu.com.cn/problem/P6075)

注意到元素之间没有相互限制

对每个元素拆开分别考虑

设 $c_{i, j}$ 表示 $A_{i, j}$ 中是否包含了当前元素

观察发现, 存在一条分界线, 使得分界线下全都是 $0$ , 分界线上全都是 $1$

于是转成格路计数, 从 $(0, 0)$ 出发, 每次只能向上或向右

发现长度都为 $k$

于是这种元素的方案数为 $2 ^ k$

总的方案数为 $(2 ^ k) ^ n$

### 炼金术（Alchemy） 

[Link](https://www.luogu.com.cn/problem/P8557)

真就在同一天被同一个套路秒了两次是吧

考虑对于每一种元素进行考虑

对单个元素的限制是宽松的, 因为只要保证她在至少出现一次

显然方案数为 $2 ^ k - 1$

总的方案数为 $(2 ^ k - 1) ^ n$
根据期望的性质, 把被攻击的次数的期望拆成产生

### 『JROI-4』沈阳大街 2

[Link](https://www.luogu.com.cn/problem/P8321)

/bx/bx/bx

太牛了

重点在值域上 dp

即对于 $\sum\prod$ 或者 $\sum\sum$ 的形式的式子, 我们考虑提取相同的项, 算贡献

可以发现, 枚举 $\pi$ 本质上是在枚举 $A$ 和 $B$ 的匹配关系

每对匹配关系的权值为 $\min \{ A, B \}$ 

显然只要满足有 $n$ 对匹配并且每个点只出现在一个匹配里即可

容易观察发现, 能够作为 $\min \{ A_i, B_{\pi_i} \}$ 最多只有 $2n$ 个数

不妨考虑对匹配 dp, 也就是考虑钦定权值为 $x \in A$ 或 $x \in B$ , 那么能和 $x$ 形成权值为 $x$ 的匹配的点只有与 $x$ 不在同一个集合的大于 $x$ 的数

若 $cnt$ 表示能和 $x$ 形成匹配的数的个数, 那么 $x$ 的贡献就是给之前的答案乘上 $cnt \cdot x$ 

不妨设 $f_{i, j}$ 表示考虑前 $i$ 大的数, 已经形成了 $j$ 组匹配

那么显然有转移 

- $(i, j) \leftarrow (i - 1, j - 1) \cdot c_i \cdot (cnt - (j - 1))$

- $(i, j) \leftarrow (i - 1, j)$

加上 $f_{i - 1, j}$ 的原因显然是她可以继承之前的状态

总的匹配方案数乘贡献显然为 $f_{2n, n}$

### Cookie Distribution

[Link](https://www.luogu.com.cn/problem/AT_dwacon6th_prelims_c)

### \[SNCPC2024\] 双子序列

[Link](https://www.luogu.com.cn/problem/P10694)

## 递推

### Infinite Sequence

[Link](https://www.luogu.com.cn/problem/AT_arc071_d)

### \[USACO20FEB\] Help Yourself G

[Link](https://www.luogu.com.cn/problem/P6146)

### \[GXOI/GZOI2019\] 逼死强迫症

[Link](https://www.luogu.com.cn/problem/P5303)

非常厉害的矩阵乘法题

我有一个和所有题解不一样的做法

## 反演

### la

[Link](https://mna.wang/contest/1388/problem/2)

dijkstra

### 删除序列

[Link](https://mna.wang/contest/1416/problem/2)

感觉是运用了反演的思想 (?)

### Petya and Coloring

[Link](https://www.luogu.com.cn/problem/CF111D)

二项式反演。

## 神秘性质

### 捏捏

[Link](https://mna.wang/contest/1395/problem/1)

## 枚举

### 车的放置

[Link](https://www.luogu.com.cn/problem/P1350)

