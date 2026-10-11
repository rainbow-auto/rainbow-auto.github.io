---

title: Diary
date: 2024-03-03 10:49:18
tags:
    - "OI"
    - "做题经验"

categories:
    - "OI"
    - "做题经验"

---

# 做题记录

开个新坑, 存放一下以后的做题记录 & 技巧总结

做的题太少了呜呜呜

## 2024.3.3

### CF1178E

[CF1178E](https://www.luogu.com.cn/problem/CF1178E)

很有意思的题

注意到只有 a, b, c 三种字符, 且相邻的两个字符一定不同

因此, 任选 $4$ 个字符一定有 $2$ 个相同的

也就是说, 在 $4$ 个字符中, 我们只保留这 $2$ 个相同的, 我们最终取出来的子序列的长度依然合法

因此直接从最左边取两个, 最右边取两个

保留着四个字符中的相同字符

### P1637 三元上升子序列

[P1637](https://www.luogu.com.cn/problem/P1637)

没什么意思

就只是值域线段树/树状数组板子

~~不是那我为什么还准备用主席树做啊~~

## 2024.3.4

### P1966 火柴排队

[P1966](https://www.luogu.com.cn/problem/P1966)

排序不等式

$a$ 和 $b$ 同序时

$\sum a_i * b_j$ 最大

~~不会证明啊qaq~~

## 2024.3.6

别问昨天干什么了, 问就是whk

把 P1966 调出来了

需要注意的一个问题是, 我们不能随意调换 $a_i$ 和 $b_i$ 的位置

因此, 必须按值在排完序之后, 再按 $a_i$ 的位置排序

我们要求的是 `pos` 的逆序对

而非原来值的逆序对

### UVA12983 The Battle of Chibi

~~赤壁之战~~

[UVA12983](https://www.luogu.com.cn/problem/UVA12983)

思路跟前面的题挺像的

树状数组优化dp

不是这个题怎么卡常啊

卡了两天没卡出来 /kk

## 2024.3.8

### P1314 聪明的质监员

~~抽象的质监员~~

[P1314](https://www.luogu.com.cn/problem/P1314)

二分一眼看出来了

显然 $W$ 越小, $y$ 越大, $W$ 越大, $y$ 越小

但学数据结构学傻了

直接一眼鉴定为可持久化值域线段树

觉得 2011 年的tg都已经如此恐怖了

其实只需要 **前缀和** !

!!!

在我们 $\log n$ 二分 $W$ 之后

`check (W)` 时根据 $W$ 来看 $v_i$ 算不算入前缀和中即可

代码没有什么需要注意的

这里记一下二分答案板子

~~总听人说二分写法繁多~~

```cpp
i64 l = 0, r = 1e13;

while (l <= r) {
    i64 mid = (l + r) >> 1;

    if (...) {
        r = mid -1;
        ans = ...;
    } else {
        l = mid +  1;
    }
}
```

## 2024.3.9

### P1311 选择客栈

[P1311](https://www.luogu.com.cn/problem/P1311)

有点逆天

本来以为随便就切掉了

结果写了一个假做法 (枚举咖啡店)

```cpp
int n, k, p;
int a[maxn];
int color[maxn];

struct Sum {
    i64 sum[maxn];
    inline i64 query (int l, int r) { return sum[r] - sum[l - 1]; }
} prefix[maxk];

int main () {
    fastread

    std::cin >> n >> k >> p;

    for (int i = 1; i <= n; i++) { 
        std::cin >> color[i] >> a[i]; 
    }

    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= k - 1; c++) {
            prefix[c].sum[i] = prefix[c].sum[i - 1];
        }

        prefix[color[i]].sum[i] ++;
    }

    i64 ans = 0;

    for (int i = 1; i <= n; i++) {
        if (a[i] > p) { continue; }
        for (int c = 0; c <= k - 1; c++) {
            ans += prefix[c].query (1, i - 1) * prefix[c].query (i + 1, n);
        }
    }

    std::cout << ans << "\n";

    return 0;
}
```

显然, 选择咖啡店的方案数会偏大

因为某两个旅馆可能多次对答案产生贡献, 旅馆数可能算重

所以假了 /kk

然后又想了想, 发现枚举旅馆一定是不会算重的

于是考虑优化过的枚举旅馆

只需要记录前面最后一个可以去的咖啡店 

以及这个咖啡店前, 有多少颜色与当前旅馆相同的旅馆

因此稍微改一点代码就能过了

```cpp
int last = -1;

for (int i = 1; i <= n; i++) {
    if (a[i] <= p) { last = i; } 

    if (last == i) {
        ans += prefix[color[i]].query (1, last - 1);
    } else {
        ans += prefix[color[i]].query (1, last);
    }
}
```

但是要注意那个毒瘤特判

必须保证两个人选择的旅馆是不同的

## 2024.3.12

唉, 生病了

甲流 + 支原体 + 细菌感染

于是好几天没有写题

### P1638 逛画展

[P1638](https://www.luogu.com.cn/problem/P1638)

水题

随意进行一个双指针即可

### P2569 股票交易

[P2569](https://www.luogu.com.cn/problem/P2569)

不是非常困难的dp

## 2024.3.23

不知道多少天没有写题了 /kk

唉唉唉 whk

### P1362 兔子数

[P1362](https://www.luogu.com.cn/problem/P1362)

容易发现

一个数是兔子数的必要条件是它的每一位都 $ \in [0, 3]$

否则会进位

必须给大家展示一下我的抽象马蜂

```cpp
int ans = 0;

for (int s1 = 0; s1 <= 3; s1 ++) 
for (int s2 = 0; s2 <= 3; s2 ++) 
for (int s3 = 0; s3 <= 3; s3 ++) 
for (int s4 = 0; s4 <= 3; s4 ++) 
for (int s5 = 0; s5 <= 3; s5 ++) 
for (int s6 = 0; s6 <= 3; s6 ++) 
for (int s7 = 0; s7 <= 3; s7 ++) 
for (int s8 = 0; s8 <= 3; s8 ++) 
for (int s9 = 0; s9 <= 3; s9 ++) 
for (int s10 = 0; s10 <= 3; s10 ++) {
    i64 now = s1 + s2 * 10 + s3 * 1e2 + s4 * 1e3 + s5 * 1e4 + s6 * 1e5 + s7 * 1e6 + s8 * 1e7 + s9 * 1e8 + s10 * 1e9;
    if (L <= now and now <= R) {
        if (S (now) * S (now) == S (now * now)) { ans ++; }
    }
}

std::cout << ans << "\n";
```

### 例题

- 求给定的长度为 $n$ 的序列所有区间异或和的和；

ix35 组合计数blog里面的例题

很有意思

异或具有良好的线性性

因此考虑按位处理

## 2024.4.20

inf 天没有写题了

决定少做数据撅够

把做题的重心转向 数学, dp 和 构造

~~然而还是先把想做的几道数据撅够写完~~

### Peaks

$\text{kruskal}$ 重构树上树剖 ~~实际上是用dfs序处理子树问题~~

~~但是我还是喜欢叫它树剖~~

然后用主席树维护一个静态区间k小

很可爱的题, 很好的帮助我复习了 $\text{kruskal}$ 重构树

$\text{kruskal}$ 重构树 实际上就是在 $\text{kruskal}$ 的过程中

按照加边的顺序, 对加入的边新建节点

成为原来的两个顶点的父亲

新建节点有点权, 点权为原来边的边权

容易发现, 这样建出来的树, 是一个**堆**, 每个节点的两个儿子的权值都比他要小

然后就可以把 $\text{kruskal}$ 生成树上的路径最值问题 转化为 $\text{kruskal}$ 重构树上的 $\text{lca}$ 的点权

## 2024.5.11

### 区间询问

[Link](https://www.luogu.com.cn/problem/T293528?contestId=169031)

hyta 小姐姐做出来的

我叹为观止

~~然后发现这其实是gss2~~

~~其实跟HH的项链也是很像的~~

开一颗可持久化线段树

用 `rt[i]` 代表以 $i$ 为右端点的询问

用 第 $i$ 个叶子节点代表左端点为 $i$ 的询问的答案

每次只需要考虑可持久化线段树上进行更新即可

对于第 $i$ 可树考虑继承 $i - 1$ 的答案

发现只需要记录 第 $i$ 个数上次和上上次出现的位置即可

此时给树中 $(prepre_i, pre_i]$ 区间加 $1$ 即可

然后发现我唐了

根本不用可持久化线段树, 只有区间加和单点查, 可以离线了用树状数组

## 2024.5.18

### Minimum Xor Pair Query

[ABC308G](https://www.luogu.com.cn/problem/AT_abc308_g)

成为 **joker** 了

> 线段树分治回溯的时候一定要记得**删除在这个节点中加入的元素**
> 
> **特别要注意叶子节点也要删除**
> 
> 不能直接 `return;`

学会了线段树分治

其实就是对时间分治

利用线段树区间加, 来维护每个数存活区间

特别地, 线段树分治中, 区间加不用下传懒标记, 运用了标记永久化的思想 (?) (也许是吧)

其本质是将 不支持删除元素 而只支持加入元素 的答案 运用线段树分治, 规避了"删除"这一操作

只需要回溯即可

### HH的项链

[P1972](https://www.luogu.com.cn/problem/P1972)

[DQUERY](https://www.luogu.com.cn/problem/SP3267)

显然这题我做过

但上周在做 beta 月赛的区间询问这道几乎一样的题的时候, 发现我居然已经忘了!

那么再写一遍吧

其本质是利用我们维护好的 $pre$ 数组 (前面出现的位置), 利用扫描线思想, 维护当前扫到的点为右端点, 所有左端点的答案

考虑对于答案进行更新, 这就需要用到我们的 $pre$ 数组

容易发现对于左端点 $\in (pre_{a_i}, i]$ 上的数在右端点为 $i - 1$ 时, $a_i$ 还没有出现过一次, 但在右端点为 $i$ 时, 出现了一次, 因此这上面的答案都要增加 $1$

因此就转化为了区间加问题

## 2024.5.20

### 火星商店问题

[火星商店问题](https://www.luogu.com.cn/problem/P4585)

发现我还是太菜了

线段树分治的核心思想是维护时间轴

时间轴上可以有点, 可以有线段

但是**并不是询问只能作点**

如果询问对元素的存在时间有限制, 那么, 询问也可以以区间的形式加到线段树上

然后, 元素以点的形式单点加到线段树上 (一路加到底)

这样对于每个线段树节点, 我们拥有: 完全覆盖它的区间, 在这个节点所维护的区间内的元素

并且, 所有这些都使 $\log_2 n$ 级别的, 于是可以直接在此统计答案

其本质就是将询问化成 $\log_2 n$ 个区间, 然后将答案合并起来

> 之前的线段树分治的本质是将元素存在时间华安成线段树上的区间

## 2024.5.22

### 等差数列

~~自己出的, 没有题目链接~~

#### Description

小 $\text{rainbow}$ 有 $n$ 个等差数列, 对于第 $i$ 个, 首项为 $a_i$, 公差为 $b_i$, 项数为 $n$

把这 $n$ 个等差数列中含有的 $n ^ 2$ 个元素放在一个数组 $c$ 中

对 $c$ 从小到大排序, 求$c$ 前 $k$ 项的和

满足 $n, k, a_i, b_i \in (0, 100000]$

#### Solution

其实就是异或粽子的简单版, 是一个很精巧的贪心 (?) (也许算是贪心罢)

我们注意到 $b_i > 0$

因此所有的等差数列中的元素必然单调递增

于是我们可以发现一个很巧妙的性质:

对于第 $i$ 个等差数列的第 $j$ 项, 它对答案产生贡献的一个必要条件是第 $i$ 个等差数列的第 $j - 1$ 项对答案产生了贡献

> 这是很显然的
> 
> 假设第 $j - 1$ 项没有对答案产生贡献
> 
> 我们知道第 $j - 1$ 项一定比第 $j$ 项小
> 
> 那么第 $j$ 项这个较大的数一定不会对答案产生贡献 (答案要求的前 $k$ 小的和)

那么于是我们就可以建立一个优先队列 (较小的数优先)

把每个等差数列的第 $1$ 项放入其中 (同时要记录这一项所属的等差数列的编号)

然后在里面取出最小值, 那么 $c$ 的第 $1$ 项就确定了

对于每次取出的最小值, 我们把它所属的等差数列的下一项放入优先队列中

然后, 反复进行 $k$ 次这样的操作

对于第 $i$ 次, 取出的一定是 $c$ 中的第 $i$ 项, 容易对其进行求和, 得到答案

### 异或粽子

[P5283](https://www.luogu.com.cn/problem/P5283)

容易发现, 这题和上一题本质相同

首先, 把区间异或和转化为端点处的前缀异或和

这里有一个小 trick

注意到 $sum_{l - 1} \oplus sum_r$ 与 $sum_{r - 1} \oplus sum_l$ 是对偶的

于是我们只需要在 $sum$ 中找到异或起来前 $2k$ 大的 $2k$ 对数

这样不需要考虑前后问题, 避免使用可持久化 01-trie

然后发现, 用来维护异或的 01-trie 也是支持查询第 $k$ 大

至此, 与上一题相同

> 注意 01-trie 的 `siz` 也要**开 $32$ 倍**捏~

## 2024.5.23

### TJOI 2018 异或

[P4592](https://www.luogu.com.cn/problem/P4592)

可持久化 01-trie 的板子

只需要再套一个树剖就行了

...

又是树剖写挂的一天捏~

树剖这个东西真的神奇, 稍微写挂一点就会寄

而我在同一个代码里犯这么多错误更是重量级

- $dep$ 要从 $1$ 开始 (?)
  
    即 `dep[1] = 1`

- $siz$ 注意初始化
  
    每次先 `siz[now] = 1`

- 跳链的时候, 比较的应为 `dep[top[u]]` 和 `dep[top[v]]` 
  
    而不是 `dep[u]` 和 `dep[v]` 这样的复杂度是错的
  
    ~~但是为什么这样写又 WA 又 TLE 啊?~~
  
    ~~不应该只是 TLE 吗?~~

### 任务查询系统

[P3168](https://www.luogu.com.cn/problem/P3168)

有人学线段树分治学魔怔了 ~~我不说是谁~~

然后发现这题**强制在线**

这个人瞬间就成为 joker 了

然后才发现这是主席树板子

题解里说, 用了差分的思想

但我个人认为, 直接用扫描线的思想更容易理解

容易发现, 每个区间开始时, 我们会往权值线段树里面它的优先级 $k$

那么在每个区间完全结束后, 我们就要从里面删除它的优先级 $k$

这与差分思想: 在 $l$ 处增加, 在 $r + 1$ 处减少 是不谋而合的 (?) 

(好像本来差分就是这么推导出来的?)

## 2024.5.25

### Count on a tree

[P2633](https://www.luogu.com.cn/problem/P2633)

可持久化线段树好题

一个显然的做法是用树剖跳链然后线段合并

但这样实在是太困难了

其实对于每个节点, 都可以维护从根节点到它的路径的可持久化线段树

这样再减去二倍的两个节点的 $\text{LCA}$ 就可以实现路径查询

## 2024.5.29

### The Bakery

[Link](https://www.luogu.com.cn/problem/CF833B)

也许算是 hh 的项链 的一个小的变式

在维护区间不同的数的个数到时候, 同时进行一个 dp 即可

因此这题就是线段树优化 dp

### Power 收集

[Link](https://www.luogu.com.cn/problem/P3800)

大家好, 我很喜欢线段树, 所以我用线段树过了这题

但是其实, 单调队列这种东西, 只是比较精巧的实现了一个区间 rmq

直接使用线段树进行 rmq 显然也是可以的

## 2024.6.16

### 约数研究

[Link](https://www.luogu.com.cn/problem/P1403)

很水的数论分块

注意到一个数 $i$ 作为约数对 $[1, n] \cap \mathbb{Z}$ 这 $n$ 个数的约数个数和 的贡献为 $\left\lfloor \frac{n}{i} \right\rfloor$

因此 $\sum\limits_{i = 1}^{n} d(i) = \sum\limits_{i = 1} ^{n} \left\lfloor \frac{n}{i} \right\rfloor$

然后, 不就 $\mathcal{O (\sqrt{n})}$ 做完了吗

### 杜教筛

其实没太看懂网上简略的推导

但我自己写了一个 *略微* 复杂的推导

> 我们约定 $*$ 表示迪利克雷卷积, $\times$ 表示普通乘法

$$
\begin{align}

S_{f * g} (n)

& = \sum\limits_{i = 1}^{n} (f * g) (i) \\

& = \sum\limits_{i = 1}^{n} (g * f) (i) \\

& = \sum\limits_{i = 1}^{n} \sum\limits_{d | i} g (d) f(\frac{i}{d}) \\

& = \sum\limits_{i = 1}^{n} \sum\limits_{d = 1}^{n} [d | i] g (d) f(\frac{i}{d}) \\

& = \sum\limits_{d = 1}^{n} \sum\limits_{i = 1}^{n} [d | i] g (d) f(\frac {i}{d}) \\

& = \sum\limits_{d = 1}^{n} g (d) \sum\limits_{i = 1}^{n} [d | i] f(\frac{i}{d}) \\

& = \sum\limits_{d = 1}^{n} g (d) \sum\limits_{k = 1}^{\left\lfloor \frac{n}{d}\right\rfloor} f (k) \\

& = \sum\limits_{d = 1}^{n} g (d) S_f (\left\lfloor \frac{n}{d} \right\rfloor) \\

& = g (1) S_f (n) + \sum\limits_{d = 2}^{n} g (d) S_f (\left\lfloor \frac {n}{d} \right\rfloor)

\end{align}

$$

整理可得 $S_f (n) = \frac{S_{f * g} - \sum\limits_{i = 2}^{n} g (d) S_f (\left\lfloor \frac{n}{i} \right\rfloor)}{g (1)}$

当然, 鉴于 $g$ 一般为积性函数, $g (1) = 1$

网上的证明经常从 $(3)$ 跳到 $(7)$, 蒟蒻表示看不懂

## 2024.7.6

放假

### [THUPC 2024 初赛] 前缀和

[Link](https://www.luogu.com.cn/problem/P9963)

非常非常厉害的概率题

咕咕咕

很想学会概率型生成函数

很想学会各种期望dp

## 2024.7.17

### Compatible Numbers

[Link](https://www.luogu.com.cn/problem/CF165E)

高维前缀和板子

把 `a & b = 0` 转化为 $a$ 与 $b$ 交集为空

即 $a$ 的补集为 $b$ 的子集

需要注意的是, 按位取反容易出问题, 不如直接异或上 $(1 << 22) - 1$

然后跑高维前缀和

> 高维前缀和
> 
> 用于解决 $\sum\limits_{i \subset x} a_i $ 一类的问题
> 
> 其实就是统计子集信息
> 
> 我们可以把 $a \subset b$ 看作高维空间上的偏序关系
> 
> (当然, 这个高维空间中只有一个边长为 $2$ 的超立方体 )
> 
> 于是我们就考虑计算高维前缀和, 即可得出答案
> 
> 虽然这里叫做前缀和, 其实可以扩展成广义上的 "和", 包括但不限于取 $\min$ , 取 $\max$

### Or Plus Max

[Link](https://www.luogu.com.cn/problem/AT_arc100_c)

考虑枚举 $k$

对于每个 $k \leq K$, 求出满足 $a_i \oplus a_j = k$ 的最大 $a_i + a_k$

等价于求 $k$ 的子集的最大值与次大值之和

## 2024.7.23

### 贪婪大陆

[Link](https://www.luogu.com.cn/problem/P2184)

在考场上我希望使用线段树套线段树维护答案。

不好评价。

并且我还不会写线段树套线段树的区间加

更不好评价了。

我们考虑, 每个修改对询问的影响

### Password

[Link](https://www.luogu.com.cn/problem/CF79D)

- Observation1 : 存在一些转移 : 如果某个串的后两个字符和某个串的前两个字符相同, 那么这两个字符串可以连起来

- Observation2 : 每个串 (转移) 必须且仅能取一次

- Conclusion : 对转移自动机建图跑欧拉路径

### 窗口的星星

[Link](https://www.luogu.com.cn/problem/P1502)

感觉好典啊

显然扫描线

扫描线那上怎样维护长度为 W 的滑动窗口中和的最大值呢 ?

直接维护原序列时不太可做的

于是我们维护答案

即考虑记 $v_t$ 为 $(t, t + W)$ 的和

考虑新增一个横坐标为 $x_0$ 的点能对 $v$ 产生什么影响

发现对于所有 $i \in (x_0 - W, x_0 + W)$ 都应该有 $v_i$ 增加 $1$  

于是我们用线段树维护 $v$

就很容易进行查询了

### [ZJOI2007] 矩阵游戏

[Link](https://www.luogu.com.cn/problem/P1129)

原命题 $\iff$ 找出恰好 $n$ 个行列互不相同的 $1$

网络流建图常见套路

把行, 列建成点

把 $1$ 作为边

然后源点连行, 列连汇点

容量都限制为 $1$ , 这样就能够每一行 / 每一列都不能被用两次

### Interval GCD

[Link](https://www.luogu.com.cn/problem/P10463)

我们发现这个区间加太唐了, 维护不了一点

因为一进行加法, 质因子全都失效了

由更相减损法, 我们可以把原序列 $a$ 某个区间 $[l, r]$ 的 $\gcd$ 转化为 $a_l$ 和这一段差分数组的 $\gcd$ 的 $\gcd$

于是差分帮助我们把区间加法转化为了单点修改

于是使用线段树维护单点修改, 区间求 $\gcd$ , 这是容易做的

## 2024.7.27

### Defender of Childhood Dreams

[Link](https://www.luogu.com.cn/problem/CF1583F)

妙妙构造题

使用了非常巧妙的递归式构造

我们考虑把原序列分成 $k$ 块, 假设我们把块内处理好了

那么, 容易发现, 块之间不会有长度大于 $k$ 的

## 2024.7.30

### LOG

[Link](https://www.luogu.com.cn/problem/P3586)

注意到, 每次 Z 操作时, 序列中所有大于等于 $S$

## 2024.8.2

$$
l = j - k \in [0, j] \\

k = j - l \\

dp_{i, j} = \max dp_{i - 1, j - k} + v_k \\

dp_{i, j} = \max\limits_{l = 0}^{j} dp_{i - 1, l} + v_{j - l} \\

$$

## 2024.8.6

终于理解了到底什么是反演

喜

### 2024.8.8

### Exotic Queries

[Link](https://www.luogu.com.cn/problem/CF1864F)

很有意思的数据结构题

那为什么没有场切

~~读错题了~~

## 2024.8.10

### Points and Powers of Two

[Link](https://www.luogu.com.cn/problem/CF988D)

好有意思啊

通过 ~~打表~~ 惊人的注意力 , 我们可以发现答案最多为 $3$

并且若设这三项从小到大为 $a, b, c$

则有 $ b - a = 2^{ k_0 } $ 和 $ c - b = 2 ^ { k_0 } $

### \[AGC059A\] My Last ABC Problem

[Link](https://www.luogu.com.cn/problem/AT_agc059_a)

很厉害的思维题

我们注意到如果把 $[l, r]$ 首尾相接, 拼成一个环

那么最终状态 (颜色全部相同) 就应该是任意两个相邻的位置都颜色相同

我们发现每次操作都一定可以并且最多可以使两个相邻的不同颜色的位置变成相同颜色的位置

于是很容易得出操作次数为 $ \left \lceil \frac{\sum\limits_{i = l + 1}^{r} [a_i \neq a_{i - 1}] + [a_r \neq a_l]}{2} \right \rceil $
d

## 2024.8.18

### CF1725L Lemper Cooking Competition

[Link](https://www.luogu.com.cn/problem/CF1725L)

考虑每次操作对前缀和数组的改变

容易发现每次操作恰好是交换相邻的两项 (且不能交换最后的两项)

而 $a_i$ 非负等价于前缀和数组单调不降

于是统计逆序对即可

同时需要满足 $\forall i \in [1, n - 1], pre_i \in [0, pre_n]$

否则无解

### P10885 [MX-S3-T1]「FeOI Round 1」野心

[Link](https://www.luogu.com.cn/problem/P10885)

思维题

~~但是我用笨蛋方法过了~~

场上 2min 口胡了一个单 log 做法, 想着 1e6 1s 应该不太容易把我卡掉

~~然后就被卡掉了~~

#### 聪明做法

通过大眼观察法, 我们可以注意到两边的公差不能同时大于 $2$

> 略证:
> 
> $1$ 必然为某一边的首项
> 
> 由于公差大于 $2$ , $2$ 不能和 $1$ 放在一起, 因而 $2$ 是另一边的首项
> 
> 然后我们可以发现, $3$ 既不能和 $2$ 放在一起, 也不能和 $1$ 放在一起
> 
> 与两个等差数列拼起来恰好为一个排列矛盾
> 
> 证毕

同时我们还可以注意到, 当一边公差是 $1$ 时, 另一边公差只能为 $n - 1$

并且, 当一边公差为 $2$ 时, 另一边只能公差为 $2$

因而合法的情况寥寥: 

1. 两边公差都为 $1$

2. 一边公差为 $1$ , 另一边公差大于 $n - 1$

3. 两边公差都为 $2$

#### 笨蛋做法

对于一个序列, 如何快速判断其排序后能否构成等差数列 ?

考虑集合哈希 (原序列可以视作无序的)

我们维护其最大值 $max$ , 最小值 $min$, 长度 $len$

容易发现, 若能够成等差数列, 则公差为 $\frac {max - min}{len - 1}$

这就要求 $\frac{max - min}{len - 1}$ 为整数

虽然这显然只是一个必要条件

但我们发现, 我们所维护的这些信息已经足以刻画合法序列, 并且这个合法序列是唯一的

于是我们对这个序列做集合哈希, 与合法序列的哈希比较即可

这里采用的哈希方法是维护立方和

首先, 合法序列的哈希是容易计算的

$$
\begin {aligned}
\sum\limits_{i = 0}^{len - 1} (min + i \cdot d) ^ 3

&= \sum\limits_{i = 0}^{len - 1} min ^ 3 + 3 \cdot min ^ 2 \cdot id + 3 \cdot min \cdot i ^ 2 d ^ 2 + i ^ 3 d^3 \\

&= min ^ 3 \cdot len + 3 \cdot min ^ 2 \cdot d \sum\limits_{i = 0}^{len - 1} i + 3 \cdot min \cdot d ^ 2 \sum\limits_{i = 0}^{len - 1} i ^ 2 + d ^ 3 \sum\limits_{i = 0}^{len - 1} i ^ 3 

\end {aligned}
$$

其中 $\sum\limits_{i = 0}^{len - 1} i ^ 2$ 和 $\sum\limits_{i = 0}^{len - 1} i ^ 3$ 都可以通过预处理 / 公式快速计算

然后, 原序列的立方和是容易维护的

进行比对即可

## 2024.8.26

### ytree

[Link](https://vjudge.net.cn/problem/CSG-1217)

太精彩了

先考虑只有操作 1 和操作 2

重点是把 $d$ 拆成 $dep_u - dep_v$

然后分离变量, 把和 $x$ 有关的提取出来

具体的, 记 $OP_u$ 为所有覆盖到 $u$ 的 1 操作

那么节点 $u$ 的权值为 $\sum\limits_{(v, x, k) \in OP_u} (-1) ^ {dep_u - dep_v} (x + k \cdot (dep_u - dep_v)) $

交换求和顺序, 得到 

$$
(-1) ^ {dep_u} \left( \sum\limits_{(v, x, k) \in OP_u} (-1) ^ {dep_v} (x - k \cdot dep_v) + dep_u \sum\limits_{(v, x, k) \in OP_u} (-1) ^{dep_v} k \right) 
$$

于是可以开两棵线段树维护里面的两个 sigma , 转化为子树加, 容易维护 dfn 序来得到

考虑加入反悔操作

考虑离线, 尝试预处理出来每个 1 操作被撤销的时间

容易发现 1 操作被撤销等价于被祖先中的最早的一个操作 3 覆盖

于是我们倒序枚举时间

每次遇到操作 3 , 就对子树取 min 

(当然也可以不取 min, 直接子树覆盖, 因为时间单调递减)

每次遇到操作 1 , 就单点查, 得到的时间即为它被撤销的时间

### CF383C Propagating tree

[Link](https://www.luogu.com.cn/problem/CF383C)

容易发现是上一题的弱化版的弱化版

### 今天我们都是龙 / 毕业季 / Journey

[Link1](https://mna.wang/contest/1222/problem/4)

[Link2](https://vjudge.net.cn/problem/CSG-1223)

[Link3](https://www.acmicpc.net/problem/8354)

场切了, 但是因为不明原因没写  (?)

赛后发现我好像是唯一一个做出来的 (???)

1. 考虑没有 $k$ 个城市的限制怎么做
   
    很简单, 矩阵快速幂后对结果矩阵求和即可

2. 考虑钦定某些点一定不被经过怎么做
   
    也很简单, 删掉所有与这些点有关的边, 然后就和 (1) 一样了

那么整道题的解法就呼之欲出了, $2 ^ k$ 容斥即可

复杂度 $\mathcal { O (2 ^ k n ^ 3 \log d) }$

(其实这题 $n, k, d$ 的数据范围已经暗示的很明显了)

## 2024.8.30

### P4396 [AHOI2013] 作业

[Link](https://www.luogu.com.cn/problem/P4396)

分块套分块

调了一年

不是哥们, 我真以为分块套分块比树套树好写

在线分块做法暴打离线莫队, 分块, win!

~~但仍然被树套树吊打~~

考虑维护

- `sum1[l][r][x]` 为 从 $l$ 到 $r$ 块, 值域块 $x$ 中出现数的个数

- `sum2[l][r][x]` 为 从 $l$ 到 $r$ 块, 值域块 $x$ 中出现的数的种类数

- `sum3[i][x]` 为前 $i$ 块中值域块 $x$ 中出现数的个数

考虑分块套分块实际上是把数列分成这样的几个部分

![image](/images/image.png)

于是便可以暴力算散块, 预处理整块, 最后合并即可

(简单容斥思想)

## 2024.9.3

### Array Queries

[Link](https://www.luogu.com.cn/problem/CF797E)

这个弹跳看起来好像弹飞绵羊啊

考虑钦定 $k$, 那就完全是不带修的弹飞绵羊

于是我们可以获得一个暴力 dp 的思路

然后发现这个思路是单次 $ \mathcal {O (n)} $ 的

但是我们发现, 每次必然向后跳至少 $k$ 步, 因而 $k$ 很大的时候答案会很小

这就变得好办了

设定阈值 $B$

当 $k > B$ 时, 不难得到的一个 $\mathcal {O (\frac{n}{B})}$ 的暴力做法

当 $k \leq B$ 时, 不难使用原先的暴力 dp 在 $\mathcal {O (Bn)}$ 的复杂度内预处理答案

平衡复杂度, 取 $B = \sqrt n$

### DZY Loves Colors

[Link](https://www.luogu.com.cn/problem/CF444C)

势能分析线段树

终于会了这个复杂度证明

做法比较简单

考虑操作二

对于只有一种颜色的区间, 直接进行权值区间加即可

对于多种颜色的区间, 我们暴力拆成只有一种颜色的区间

由于每次原先有 $n$ 个颜色段, 每次修改只会增加 $O (1)$ 段区间

因此在整个过程中出现过的颜色段是 $O (n + q)$ 级别的

但是每个颜色段只会被处理一次 (我们处理过后这个颜色段一定被覆盖成新的颜色段了)

又因为对一个颜色段处理的复杂度是 $O (\log n)$

所以总复杂度为 $O ((n + q) \log n)$

可以认为均摊下来是单次 $O (\log n)$ 的

## 2024.9.4

### [ARC071F] Infinite Sequence

[Link](https://www.luogu.com.cn/problem/AT_arc071_d)

场上好像读错题了 (?)

首先进行一个观察

发现若 $a_i > 1$ 并且 $a_{i + 1} > 1$ , 那么序列就会变成 $a_ia_{i + 1}a_{i + 1} \cdots$ 这样的形式

否则 $a_{i + 1} = 1$ , 序列只能变成 $a_{i}$ 加上 $a_i$ 个 $1$ 再加上一个新的合法序列

容易发现这样天然适合从后往前 dp

设 $f_i$ 表示 $i$ 以后填好的方案数

- 在 $i$ 和 $i + 1$ 上都填上非 $1$ 的数 
  
    $f_i \leftarrow (n - 1) ^ 2 $

- 在 $i$ 上填非 $1$ 的数, 后面填 $x$ 个 $1$
  
    $f_i \leftarrow \sum\limits_{x = 2}^{n} f_{i + x + 1} = \left(\sum\limits_{j = i + 3}^{n} f_j \right) + (i + 1)$
  
    对于 $j > n$ 的 $f_j$ , 我们把她视作 $1$
  
    一共有 观察上面左边的和式共有 $n - 1$ 项, 其中只有 $n - i - 2$ 项满足 $i + x + 1 \leq n$, 因而有 $i + 1$ 个 $1$

- 在 $i$ 上填 $1$
  
    $f_i \leftarrow f_{i + 1} $

答案显然为 $f_1$

边界:

- $f_n = n$

- $f_{n - 1} = n ^ 2$

维护后缀和容易进行转移

### Segment Sum

[Link](https://www.luogu.com.cn/problem/CF1073E)

数位 dp 水题 (?)

注意到 $l$ 和 $r$ 的位数最多只有 $18$

考虑状压有哪些数位出现过, 这样状态数是 $2 ^ {10} \times 18$

然后考虑十进制拆位 (?)

对于每一位, 第 $pos$ 位填 $x$ 所能产生的贡献为 $x \cdot 10 ^ {pos - 1} \cdot cnt$ , 其中 $cnt$ 为前 $pos$ 位的合法方案数

因此我们不止要统所有满足条件的和, 还要统计方案数

这也许体现了求和与计数之间的奇妙联系 (?)

注意! **前导零不要算到状态里面**

```cpp
std::pair <i64, i64> mem[maxn][maxS];
std::pair <i64, i64> dp (int now, int S, bool lim, bool lead) {
    if (not now) { return { popcount (S) <= k, 0 }; }
    if (not lim and not lead and mem[now][S].first != -1) { return mem[now][S]; }

    std::pair <i64, i64> res = { 0, 0 };

    int mx = lim ? a[now] : 9;
    rep (t, 0, mx) {
        int nS = (lead and t == 0) ? S : (S | (1 << t));

        i64 cnt, sum; 
        std::tie (cnt, sum) = dp (now - 1, nS, lim and t == mx, lead and t == 0);

        res.first += cnt; res.first %= mod;
        res.second += (t * pw10[now - 1] % mod * cnt % mod + sum) % mod; res.second %= mod;
    }

    if (not lim and not lead) { mem[now][S] = res; }
    return res;
}
```

## 2024.9.5

### [SHOI2012] 回家的路

[Link](https://www.luogu.com.cn/problem/P3831)

非常好题目, 是我发现我对分层图的理解过于浅薄, 爱来自SH

也许可以把分层图理解成自动机 (?)

其实就是像网络流建模一样, 分层图也可以被视作一种建模思路

只不过在网络流建模建出的图上跑的是网络流, 在分层图上跑的是最短路

## 2024.9.6

### Beautiful Pair

[Link](https://www.luogu.com.cn/problem/P4755)

分治好题

~~但是我不是在找笛卡尔树的题吗~~

首先注意到最大值, 确实可以枚举最大值做

更为优雅的枚举最大值的方法是分治

对于当前处理的区间 $(l, r)$ , 找出最大值 $mx$ 所在位置 $pos$ 

先处理跨越 $pos$ 的情况, 容易发现, 此时最大值已经确定, 因而原问题等价于固定一个 $i$ , 找另一边有多少个数不大于 $\frac{mx}{a_i}$

采用启发式的方法处理, 对于 $pos$ 左右两个区间, 我们选择其中小的一个枚举 $i$ , 在另一边中寻找不大于 $\frac{mx}{a_i}$ 的数的个数

显然这些询问不强制在线, 离线下来随便做

## 2024.9.7

### [HNOI2016] 序列

[Link](https://www.luogu.com.cn/problem/P3246)

非常好题目, 爱来自HN

考虑对于一个询问

## 2024.9.16

### 算术天才⑨与等差数列

[Link](https://www.luogu.com.cn/problem/P5278)

很早以前就知道做法的题

考虑集合哈希

## 2024.9.21

### \[NOI Online #1 提高组\] 序列

[Link](https://www.luogu.com.cn/problem/P6185)

可爱题

喵喵喵

## 2024.9.24

### [AGC012D] Colorful Balls

[Link](https://www.luogu.com.cn/problem/AT_agc012_d)

组合意义天地灭，代数推导保平安。

看到乘法一定要考虑组合意义优化！

这里，$c$

## 2024.9.26

### Daniel and Spring Cleaning

[Link](https://www.luogu.com.cn/problem/CF1245F)

可爱题。

$a \oplus b = a + b \iff a \operatorname{and} b = 0$

因为异或实际上是不进位的加法

想要让异或结果等于加法结果，就需要钦定二进制加法中不能产生进位。

## 2024.10.1

ZR 就是 ZR，给备战 noip 的同学们训练蓝紫黑黑黑黑黑难度的题。

### CF1762D GCD Queries

蒟蒻的人生中第一道交互题

感觉太牛了

首先有一个性质，$\gcd (x, 0) = x$

~~不会有人和我一样认为他是零吧~~

显然我们希望找一个 $a_i = 0$ 的充要条件

但这是不容易的

那我们把条件放宽，先只找出她的必要条件

显然有 $a = 0 \Rightarrow (a, b) \not = (a, c)$ 

虽然这个显然不充分

但我们不妨考虑这个命题的逆否命题 $(a, b) = (a, c) \Rightarrow a \not = 0$

这样并不能帮助我们找出那些是 $0$，但是可以帮我们排除不是 $0$ 的数

同理，我们发现 

- $(a, b) < (a, c) \Rightarrow b \not = 0$
- $(a, b) > (a, c) \Rightarrow c \not = 0$

因此每次随便找三个数，我们都能排除至少一个数

也是“找三个数”这样的操作只需要做 $n - 2$ 次

总操作次数为 $2n - 4$

### CF1406E Deleting Numbers

蒟蒻人生中第二道交互题

### CF1656H Equal LCM Subsets

[Link](https://www.luogu.com.cn/problem/CF1656H)

没想到有一天中午醒来脑子处于混沌状态想出来的东西真的有题能用上！

首先考虑值域为 $1e9$ 的时候怎么做

直接选是困难的，我们考虑先把所有数都选了

## 2024.10.2

### P7880 \[Ynoi2006\] rldcot

数据撅狗

### P7897 \[Ynoi2006\] spxmcq

数据撅翻

我这 `long long` 开了就和开了一样

```cpp
i64 query(int pos) {
    int res = 0;
    for (int i = pos; i; i -= lowbit(i)) res += tr[i];
    return res;
}
```

## 2024.10.5

### P5304 \[GXOI/GZOI2019\] 旅行者

[Link](https://www.luogu.com.cn/problem/P5304)

萌萌题。

## 2024.10.7

### P8572 [JRKSJ R6] Eltaw

[Link](https://www.luogu.com.cn/problem/P8572)

根号分治

通常我们从两个角度考虑暴力，一种是询问时暴力，另一种是提前预处理某些东西

### CF797E Array Queries

根号分治。

## 2024.10.8

### P5309 \[Ynoi2011\] 初始化

[Link](https://www.luogu.com.cn/problem/P5309)

好像，还是根号分治？

有点太牛了。

### P4552 \[Poetize6\] IncDec Sequence

[Link](https://www.luogu.com.cn/problem/P4552)

差分优化 /se/se/se

### CF79D Password

[Link](https://www.luogu.com.cn/problem/CF79D)

这个也是差分优化 /se/se/se

## 2024.10.12

### P2201 数列编辑器

[Link](https://www.luogu.com.cn/problem/P2201)

一个重要性质就是查询的时候 $k \leq p$

也就是说，只需要维护光标前的信息即可

然后容易发现每次至多向光标前加入一个数

维护一个 $sum_p$ 表示 $\sum\limits_{i = 1}^{p} a_i$ ，和一个 $mx_p$ 表示 $\max\limits_{i = 1} ^ {p} sum_i$

这两个东西都是容易更新的。

然后可以上一个链表或者对顶栈维护顺序。

### 团体队列 Team Queue

[Link](https://www.luogu.com.cn/problem/UVA540)

简单题。

考虑维护有哪些团队在大队列

再对于每个团队分别维护成员的顺序即可

这样，每次加入新数的时候：

- 对于所属团队在队列的情况，直接加入所属团队的队列即可

- 对于所属团队不在队列的情况，把所属团队加入大队。

## 2024.10.16

### P3620 \[APIO/CTSC2007\] 数据备份

[Link](https://www.luogu.com.cn/problem/P3620)

反悔贪心

太牛了

## 2024.10.18

[Link](https://www.luogu.com.cn/problem/P9508)

构造

惊恐 😱

## 2024.10.30

### P3619 魔法

[Link](https://www.luogu.com.cn/problem/P3619)

Exchange Argument

**和顺序相关的最优化问题优先考虑 Exchange Argument**

推导还算比较平凡。

首先按照 $b$ 进行分类，优先处理 $b \geq 0$ 的任务。这个策略是显然正确的，因为在 $b \geq 0$ 时，$T$ 单调不降，使 $T$ 变大显然是不劣的。

对于 $b \geq 0$ 的任务，一个显然的贪心是按照 $t_i$ 排序后的顺序依次完成。

对于 $b < 0$ 的任务，考虑 Exchange Argument，不妨设任务 $i$ 必须放在任务 $j$ 之前完成，那么我们有 $T + b_i > t_j$ 和 $T + b_j \leq t_i$（两个式子的意义分别是 $i$ 在 $j$ 前面是合法的和 $j$ 在 $i$ 前是不合法的），推一下发现有 $t_j - b_i < T \leq t_i - b_j$，也即 $t_i + b_i > t_j + b_j$，因而按照 $t_i + b_i$ 降序一次完成即可。

~~这个感觉比对比一些神秘的解释有理有据的多~~

## 2024.10.31

### P6155 修改

[Link](https://www.luogu.com.cn/problem/P6155)

神秘贪心 😱😱😱

有点太牛了

## 2024.11.1

### P1269 信号放大器

[Link](https://www.luogu.com.cn/problem/P1269)

很好的树上贪心。

每次从叶子开始考虑。

### P3915 树的分解

[Link](https://www.luogu.com.cn/problem/P3915)

和上一题本质相同 😍😍😍

## 2024.11.4

### P2127 序列排序

[Link](https://www.luogu.com.cn/problem/P2127)

考虑置换环。

注意到每个点入度和出度均为 $1$ 的图一定是一堆环。

并且每个环都独立，我们吧这些环称为置换环，考虑对于每个环分开考虑。

### P3615 如厕计划

[Link](https://www.luogu.com.cn/problem/P3615)

折线 😱😱😱😱

考虑限制：

- 两名男生不得同时使用厕所

- 不得有厕所处于空闲状态

### CF1994D Funny Game

[Link](https://www.luogu.com.cn/problem/CF1994D)

好像从 csp 开始前就一直在想这题了呢

~~然后 csp 就爆了~~

我们考虑一个符合人类价值观的性质，越小的数其实限制越松。

就像任意两个数都可以放在第一步进行合并，因为他们模 $1$ 必然是同余的。

考虑社会主义核心价值观，我们优先处理紧的限制。

也就是说，从大到小处理。

对于第 $k$ 步，我们希望选取两个不在同一个连通块的模 $k$ 同余的两个点进行连边。

又注意到，在第 $n - 1$ 步中有 $n$ 个连通块，那么在第 $k$ 步中有 $k + 1$ 个连通块，因而在模 $k$ 意义下必然能找到两个不在同一连通块内的数，使她们模 $k$ 同余（鸽巢原理）。

太精彩了 🥳🥳🥳

## 2024.11.6

### P11244 吻秋

[Link](https://www.luogu.com.cn/problem/P11244)

可爱 🥳🥳🥳

降红了 😱😱😱

## 2024.11.7

### P4778 Counting swaps

[Link](https://www.luogu.com.cn/problem/P4778)

构造双射！！！

太牛了！！！

## 2024.11.14

### AT_dp_t Permutation

[Link](https://www.luogu.com.cn/problem/AT_dp_t)

这个是真的很牛

考虑这个题只关心大小关系，因而可以使用排名来刻画状态。

具体地，我们设 $f_{i, j}$ 表示前 $i$ 个数，第 $i$ 个数排名为 $j$

容易去钦定前 $i - 1$ 个数中加入一个新的数之后，这个新的数的排名。

具体地，钦定第 $i$ 个数第在前 $i$ 个数中的排名为 $j$，若 $s_{i - 1}$ 为 $ >$，那么第 $i - 1$ 个数的排名必须小于 $j$，并且这样的状态一定是合法的；若 $s_{i - 1} $为 $<$ 那么第 $i - 1$ 个数的排名必须大于等于 $j$。

也就是 

$$
    f_{i, j} = \begin{cases}
        \sum\limits_{k < j} f_{i, k}&s_{i - 1} = \mathtt{"<"}\\
        \sum\limits_{k \geq j} f_{i, j}&s_{i - 1} = \mathtt{"<"}\\
    \end{cases}
$$

前缀和优化一下即可。

## 2024.11.15

### P9974 \[USACO23DEC\] Candy Cane Feast B

[Link](https://www.luogu.com.cn/problem/P9974)

可爱诈骗题 /se

注意到当糖果高度大于第一只奶牛的高度时，第一只奶牛的高度会翻倍；

而当糖果高度小于第一只奶牛的高度时，第一只奶牛会立即吃掉整个糖果。

因而对于其他奶牛，至多只会有 log 次机会被更新。

于是复杂度为 $\mathcal{O(n + m + n \log V)}$

### P10143 \[WC2024\] 代码堵塞

[Link](https://www.luogu.com.cn/problem/P10143)

$n, T$ 范围看反了调了一年 /fn/fn/fn

发现答案是 $\sum\sum a_i$ 的形式，并且 $a_i$ 的数量是 $O(n)$ 级别的，容易想到拆贡献，转换为 $\sum a_i \sum$ 的形式。

具体地，对于一个特定的 $a_i$，我们考虑计算她在多少种序列中是合法的。

考虑分类讨论，

- 当 $a_i$ 被视作一个结果可见的题时，限制为 $a_i$ 前面的可见的题的时间和应当小于等于 $T - t_i$，并且 $a_i$ 后面可以随意分配

- 当 $a_i$ 被视作一个结果不可见的题时，容易发现 $a_i$ 前面的所有题都会在 $a_i$ 之前被做，$a_i$ 后面第结果可见的题也会在 $a_i$ 之前被做，因而限制为 $a_i$ 后面选择的可见的题的时间和应当小于等于 $T - \sum\limits_{j \leq i} t_j$ 并且 $a_i$ 前面可以随意分配

然后做一个类似背包的转移就做完了。

## 2024.11.18

### \[ABC380G\] Another Shuffle Window
 
[Link](https://www.luogu.com.cn/problem/AT_abc380_g)

没场切 /fn/fn/fn

发怒了。

考虑对一个区间 $[i, i + k - 1]$ 进行打乱，那么未打乱的部分的贡献其实是没有变化的，并且只有一端在该区间中的逆序对其实也是没有变化的（可以理解为相对位置没有变）。

于是我们注意到只有恰好两端都在　$[i, i + k - 1]$ 的逆序对会因为打乱而改变。

根据期望的线性性，容易把贡献拆开，拆成两端都在区间内的部分和其他部分。

考虑一个长度为 $k$ 的元素互不相同的序列的逆序对数量期望，容易发现每一对数都有 $\frac{1}{2}$ 的概率产生贡献，因而期望为 $\frac{1}{2} { {k} \choose {2} }$。

然后关于统计其他部分，简单容斥可得只需要用总体逆序对数减去 $[i, i + k - 1]$ 中的逆序对数。然后就转化为了统计一个滑动窗口中的逆序对数量，又因为每次只会在最后追加一个元素，在开头删去一个元素，容易用值域数据结构统计贡献变化。

然后就做完了。

## 2024.12.21

处于半退役文化课时期。

唉唉。

想起 noip，还是会很心痛。

我咋不会整除分块了 /jk

首先记一下整除分块的结论，满足 $\lfloor \frac{n}{i} \rfloor = \lfloor \frac{n}{j} \rfloor$ 的最大 $j$ 为 $\lfloor\frac{n}{i}\rfloor$

其实只需要知道 $i = \frac{n}{\frac{n}{i}} \leq \frac{n}{\lfloor\frac{n}{i}\rfloor}$

正确性是显然的，因为必然有 $\frac{n}{i} \geq \lfloor\frac{n}{i}\rfloor$

并且这个 $i$ 的最大值是可以取到的，因为 $\frac{n}{\frac{n}{\lfloor\frac{n}{i}\rfloor}} = \lfloor\frac{n}{i}\rfloor$

## 2024.12.21

?

## 2025.7.12

咋七个月过去了。

调整了策略，总结的经验放在 `Tricks.md` 里面，做题记录放 vjudge 上。

于是这个 1700 行的做题记录的使命终结了。

