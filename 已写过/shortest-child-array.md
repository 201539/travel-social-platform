/*
最短子数组
给定一个含有 n 个正整数的数组和一个正整数 target 。

找出该数组中满足其总和大于等于 target 的长度最小的 子数组

{nums[l], nums[l+1], ..., nums[r-1],nums[r]} ，并分别返回该子数组的左右下标之和（l+r)。如果存在不止一个这样的子数组，返回最小左右下标和。
如果不存在符合条件的子数组，返回 0 。

输入描述
正整数个数n,正整数数组nums,目标正整数target。

输出描述
满足条件的子数组左右下标和;如果不存在符合条件的子数组，返回0

提示
1.可以构造可供二分查找的数组解决这个问题吗？

2.左下标变化的时机可不可以优化？

解决以上其中一点就可以拿到全部分数。

示例
示例 1
输入

5
72 33 9 10 8
1000
输出

0
解析

无

示例 2
输入

5
1 2 3 4 5
3
输出

2
解析

子数组{3}满足长度最短且左下标最小

注意：出题人的计算下标和的本意是子数组最小下标+子数组最大下标。如果子数组长度为1，如示例二的情况，那么只有一个下标，就不存在最小最大的说法，直接输出这个下标即可。
和一般意义的数组左右下标不一样。比如示例二，目标子数组为{3}，输出不用考虑2+2，直接输出2即可。如果示例2的target改为6，目标子数组变为{3，4}，此时需要输出2+3（5）。
为防止歧义，特此说明！！
*/
#include <iostream>
#include <climits>

using namespace std;

int main() {
    int n = 0;
    int target = 0;
    cin >> n;

    // 处理输入
    int nums[n];
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    cin >> target;

    int min_index = INT_MAX;
    int min_len = INT_MAX;
    int sum = 0;
    int left_index = 0;
    int right_index = 0;

    for (; right_index < n; right_index++) {
        sum += nums[right_index];

        while (sum >= target) {
            int current_len = right_index - left_index + 1;
            int current_index = (left_index == right_index) ? left_index : left_index + right_index;
            if (current_len < min_len || (current_len == min_len && current_index < min_index)) {
                min_len = current_len;
                min_index = current_index;
            }

            sum -= nums[left_index];
            left_index++;
        }
    }

    if (min_len == INT_MAX) {
        cout << 0 << endl;
        return 0;
    } else {
        cout << min_index << endl;
        return 0;
    }
}