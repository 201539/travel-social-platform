/*
密钥格式化
    给定一个许可密钥字符串 s，仅由字母、数字字符和破折号组成。字符串由 n 个破折号分成 n + 1 组。你也会得到一个整数 k 。

    我们想要重新格式化字符串 s，使每一组包含 k 个字符，除了第k组，它可以比 k 短，但仍然必须包含至少一个字符。此外，两组之间必须插入破折号，并且应该将所有小写字母转换为大写字母。

    需要注意的是，格式化后的密钥如果出现某一组（第k组除外）完全由字母或者数字组成，将会被认定为安全性不足，视为无效格式化。

    如果密钥字符串可以格式化为有效密钥，请输出格式化后的密钥；如果不可以格式化为有效密钥，请返回INVALID。

    输入描述
    一个许可密钥字符串 s，仅由字母、数字字符和破折号组成。

    一个整数 k，表示格式化后的密钥每组应容纳的字符数。

    输出描述
    满足条件的密钥字符串；如果不能生成有效密钥，请返回INVALID。

    提示
    1.可以先去除掉原始密钥中的分隔符，再进行字符串处理。

    2.请注意考虑边界条件。

    示例
    示例 1
    输入

    2-jkl-3y 2
    输出

    2J-KL-3Y
    解析

    只有第二（k)组全部为字母，所以输出为2J-KL-3Y

    示例 2
    输入

    3-jkL-2Iop-8i 3
    输出

    3JK-L2I-O-P8I
    解析

    只有第三(k)组全部为字母，所以输出3JK-L2I-O-P8I
*/
#include <iostream>
#include <string>

using namespace std;

int main() {
    string s;
    int k = 0;
    cin >> s >> k;

    // 处理字符串中的分隔符, 小写字母转换为大写
    string op_s;
    for (char c : s) {
        if (c == '-') continue;
        if ((c > 96) && (c < 123)) c -= 32;
        op_s += c;
    }

    int kcount = op_s.size() % k;
    int counts = (kcount == 0) ? (op_s.size() / k) : (op_s.size() / k + 1);
    kcount = (kcount == 0) ? k : kcount;

    if (counts < k && kcount != 0) {
        cout << "INVALID" << endl;
        return 0;
    }

    string res[counts];

    for (int i = 1; i <= counts; i++) {
        if (i > k)
            res[i - 1] = op_s.substr(k * (i - 2) + kcount, k);
        else if (i == k)
            res[i - 1] = op_s.substr(k * (i - 1), kcount);
        else
            res[i - 1] = op_s.substr(k * (i - 1), k);
    }

    string ans;
    for (int i = 0; i < counts; i++) {
        bool contract = true;
        if (i + 1 != k) {
            contract = false;
            for (int j = 0; j < res[i].size(); j++) {
                if ((res[i][j] >= '0') && (res[i][j] <= '9')) {
                    contract = true;
                    break;
                }
            }
        }
        if (!contract) {
            cout << "INVALID" << endl;
            return 0;
        }
        ans += res[i];
        if (i + 1 == counts) continue;
        ans += "-";
    }

    cout << ans << endl;
    return 0;
}