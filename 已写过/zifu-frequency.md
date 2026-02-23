/*
字母频率统计
现在有一个词典，可以支持两种操作，分别为add与query，add操作接收一个字符串并将其加入词典中，query操作为查询词典中出现频率最高的字母并输出，
若有多个字母出现频率相同则同时输出并按字母表排序。

输入描述
第一行一个正整数q，代表操作次数 接下来q行每行为一次操作

add word：其中word为一个string类型的变量（仅由小写字母组成），表示向词典中加入单词word
query：查询词典中出现频率最高的字母，输出一个字符串，表示所有出现频率最高的字母，若此时词典为空，则输出空字符串
输出描述
每行为一次query操作的输出

提示
1 <= q <= 1000

1 <= word.length <= 100

示例
示例 1
输入

2
add hello
query
输出

l
示例 2
输入

3
add hello
add cpp
query
输出

lp
示例 3
输入

4
query
add add
add query
query
输出


d

*/
#include <iostream>

#include <string>

using namespace std;

int main() {

    // 用于记录字母出现的次数
    int alpha[26] = {0};

    int q = 0;
    string op;

    cin >> q;
    for (int i = 0; i < q; i++) {
        cin >> op;
        if (op == "add") {
            string word;
            cin >> word;
            for (char c : word) {
                alpha[c - 'a'] += 1;
            }
        } else if (op == "query") {
            int max_count = 0;

            for (int count : alpha) {
                if (count > max_count) max_count = count;
            }

            if (max_count == 0) continue;
            string res;
            for (int i = 0; i < 26; i++) {
                if (alpha[i] == max_count) res += (char)(i + 'a');
            }

            cout << res << endl;
        }
    }

    return 0;
}