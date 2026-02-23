/*
方程的解
通过二分法计算方程e^x=ax+b在(0, 10)上的解

输入描述
两个浮点数，以空格分隔，分别表示a和b，可能以科学计数法表示

输出描述
一个浮点数，为方程的解，保留6位有效小数

提示
输入保证方程在(0, 10)上有且仅有一解

示例
示例 1
输入

2.0 1.0
输出

1.256431
示例 2
输入

0.05 3.1415
输出

1.163042
*/
#include <iostream>
#include <cmath>
#include <iomanip>

using namespace std;

int main() {
    double a = 0.0;
    double b = 0.0;
    cin >> a >> b;

    double left = 0.0;
    double right = 10.0;
    double epsilon = 1e-7;

    while (right - left >= epsilon) {
        double mid = (right + left) / 2;
        double res = exp(mid) - a * mid - b;
        double res_right = exp(right) - a * right - b;

        if (res == 0)
            break;
        else if (res * res_right < 0)
            left = mid;
        else
            right = mid;
    }

    cout << fixed << setprecision(6) << (right + left) / 2 << endl;
}