/*
神奇的电子表
台风过后，助教突然发现宿舍里多出了一块电子表，在送交电子表的路上，助教发现这块电子表的时间和北京时间对不上，于是他打算修好这块表。经过几天的观察，助教发现每过1h的时间，表的时间就会比北京时间滞后1分钟，即北京每经过1h,表时间经过59min。北京时间2024-09-16T00:00:00时，电子表显示的时间为2024-09-01T22:20:00。需要你完成一个程序，输入电子表当前的时间，输出真实的北京时间，结果精确到秒(向下取整)，即忽略毫秒。

输入描述
电子表当前的时间，以空格分隔，依次为 year month day hour minute second 其中month为月份的英文单词，首字母大写，其余均为整数

输出描述
YYYY-MM-DDThh:mm:ss 例如2024年9月18号23点59分59秒表示为2024-09-18T23:59:59

提示
认为电子表的时间是均匀流逝的。
保证输入为2024年后的合法日期，2024 <= year < 3000
注意闰年的判定：四年一闰，百年不闰，四百年再闰
不用库是一定能做的，注意数据类型
示例
示例 1
输入

2024 September 1 22 20 59
输出

2024-09-16T00:01:00
示例 2
输入

2025 May 1 12 0 0
输出

2025-05-19T15:55:55
示例 3
输入

2024 January 1 0 0 0
输出

2024-01-10 22:02:02
示例 4
输入

2028 January 25 9 44 0
输出

2028-02-29T12:00:00
*/
#include <iostream>
#include <string>
#include <iomanip>
#include <map>

using namespace std;

long watch2seconds(int year, int month, int day, int hour, int minute, int second);

void seconds2watch(long seconds);

bool is_leap_year(int year);

int main() {
    int year;
    string o_month;
    int month;
    int day;
    int hour;
    int minute;
    int second;

    cin >> year >> o_month >> day >> hour >> minute >> second;

    map<string, int> monthMap = {
        {"January", 1}, {"February", 2}, {"March", 3}, {"April", 4}, {"May", 5}, {"June", 6}, {"July", 7}, {"August", 8}, {"September", 9}, {"October", 10}, {"November", 11}, {"December", 12}};

    month = monthMap[o_month];

    long standard_watch_seconds = watch2seconds(2024, 9, 1, 22, 20, 0);
    long standard_bj_seconds = watch2seconds(2024, 9, 16, 0, 0, 0);
    long now_watch_seconds = watch2seconds(year, month, day, hour, minute, second);
    long diff = now_watch_seconds - standard_watch_seconds;
    long bj_diff = (diff >= 0) ? diff * (60 / 59.0) : diff * (60 / 59.0) - 1;
    long now_bj_seconds = standard_bj_seconds + bj_diff;

    seconds2watch(now_bj_seconds);
    return 0;
}

long watch2seconds(int year, int month, int day, int hour, int minute, int second) {
    long diff_second = second;
    long diff_minute = minute * 60;
    long diff_hour = hour * 3600;
    long diff_day = (day - 1) * 24 * 3600;
    long diff_month = 0L;
    for (int i = 1; i < month; i++) {
        if (i == 2)
            diff_month += is_leap_year(year) ? 29 * 24 * 3600 : 28 * 24 * 3600;
        else if (i == 1 || i == 3 || i == 5 || i == 7 || i == 8 || i == 10 || i == 12)
            diff_month += 31 * 24 * 3600;
        else
            diff_month += 30 * 24 * 3600;
    }
    long diff_year = 0L;
    for (int i = 2024; i < year; i++) {
        diff_year += is_leap_year(i) ? 366 * 24 * 3600 : 365 * 24 * 3600;
    }
    return diff_second + diff_minute + diff_hour + diff_day + diff_month + diff_year;
}

void seconds2watch(long seconds) {
    long whole_day = seconds / (24 * 3600);
    seconds = seconds % (24 * 3600);
    int hour = seconds / 3600;
    seconds = seconds % 3600;
    int minute = seconds / 60;
    seconds = seconds % 60;

    int year = 2024;
    int month = 1;
    int day = 1;
    while (whole_day > 0) {
        int year_day = is_leap_year(year) ? 366 : 365;
        if (whole_day >= year_day) {
            whole_day -= year_day;
            year++;
            continue;
        }
        while (whole_day > 0) {
            int month_day = 0;
            if (month == 2)
                month_day = is_leap_year(year) ? 29 : 28;
            else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12)
                month_day = 31;
            else
                month_day = 30;
            if (whole_day >= month_day) {
                whole_day -= month_day;
                month++;
            } else {
                day += whole_day;
                whole_day = 0;
            }
        }
    }

    cout << year << "-" << setfill('0') << setw(2) << month << "-" << setfill('0') << setw(2) << day
         << "T" << setfill('0') << setw(2) << hour << ":" << setfill('0') << setw(2) << minute << ":" << setfill('0') << setw(2) << seconds << endl;
}

bool is_leap_year(int year) {
    if (year % 4 == 0 && year % 100 != 0) return true;
    if (year % 400 == 0) return true;
    return false;
}