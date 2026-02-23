#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int timeToMinutes(const string &time) {
    int hours = stoi(time.substr(0, 2));
    int mimutes = stoi(time.substr(3, 2));
    return hours * 60 + mimutes;
}

int main() {
    int n;
    cin >> n;
    vector<string> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i];
    }

    vector<pair<int, int>> parsedIntervals;

    for (const string &s : intervals) {
        int start = timeToMinutes(s.substr(0, 5));
        int end = timeToMinutes(s.substr(6, 5));
        parsedIntervals.push_back({start, end});
    }

    sort(parsedIntervals.begin(), parsedIntervals.end(), [](const pair<int, int> &a, const pair<int, int> &b) {
        return a.second < b.second;
    });

    int endTime = -1, count = 0;

    for (auto &interval : parsedIntervals) {
        if (endTime <= interval.first) {
            endTime = interval.second;
        } else
            count++;
    }

    cout << count << endl;

    return 0;
}