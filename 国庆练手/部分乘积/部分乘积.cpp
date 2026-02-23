#include <iostream>
#include <vector>
#include <climits>
using namespace std;

bool willOverflow(long long a, long long b) {
    // 检查乘法是否会导致int溢出
    if (a == 0 || b == 0) return false;
    
    // 检查正溢出
    if (a > 0 && b > 0) {
        return a > INT_MAX / b;
    }
    // 检查负溢出
    else if (a < 0 && b < 0) {
        return a < INT_MAX / b;
    }
    // 检查混合符号溢出
    else if (a > 0 && b < 0) {
        return b < INT_MIN / a;
    }
    else { // a < 0 && b > 0
        return a < INT_MIN / b;
    }
}

int main() {
    int n;
    cin >> n;
    
    vector<int> numbers(n);
    for (int i = 0; i < n; i++) {
        cin >> numbers[i];
    }
    
    vector<int> results;
    long long product = 1;
    
    for (int i = 0; i < n; i++) {
        // 检查乘法是否会溢出
        if (willOverflow(product, numbers[i])) {
            results.push_back(-1);
            break;
        }
        
        product *= numbers[i];
        
        // 检查结果是否超出int范围
        if (product > INT_MAX || product < INT_MIN) {
            results.push_back(-1);
            break;
        }
        
        results.push_back((int)product);
    }
    
    // 输出结果
    for (int i = 0; i < results.size(); i++) {
        if (i > 0) cout << " ";
        cout << results[i];
    }
    
    cout << endl;
    return 0;
    
}

