---

# 📘 C++ 机考核心知识点速查（含完整代码示例）

> ✅ 覆盖：输入输出｜STL 容器｜字符串｜头文件｜结构体｜排序｜类型转换  
> ✅ 所有代码均可直接复制编译运行（C++11 及以上）

---

## 1️⃣ 基本输入输出（I/O）

### 🔹 核心头文件
```cpp
#include <iostream>  // cin, cout, endl
#include <string>    // string, getline
```

### 🔹 基本读写（跳过空白）
```cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    double x;
    string word; // 无空格单词

    cin >> a >> b >> x >> word; // 自动跳过空格/换行
    cout << "Sum: " << a + b << "\n";
    cout << "Word: " << word << "\n";
    return 0;
}
```
**输入示例**：  
```
10 20 3.14 Hello
```
**输出**：  
```
Sum: 30
Word: Hello
```

> ⚠️ `cin >>` **不能读含空格的字符串**！

---

### 🔹 读一整行（含空格）— `getline`
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    cout << "Enter a line: ";
    getline(cin, line); // 读整行（包括空格）
    cout << "You entered: [" << line << "]\n";
    return 0;
}
```
**输入示例**：  
```
Hello World! How are you?
```
**输出**：  
```
You entered: [Hello World! How are you?]
```

---

### 🔹 ⚠️ 混合输入陷阱与修复（重点！）
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    int id;
    string name;

    cin >> id;          // 输入：123<回车>
    // 此时缓冲区还有 '\n'，直接 getline 会读空行！
    cin.ignore();       // 👈 清除缓冲区中的换行符
    getline(cin, name); // 现在可正确读 "Alice Smith"

    cout << "ID: " << id << ", Name: " << name << "\n";
    return 0;
}
```
**输入示例**：  
```
123
Alice Smith
```
**输出**：  
```
ID: 123, Name: Alice Smith
```

> ✅ **口诀**：`cin >>` 后接 `getline`，**必加 `cin.ignore()`**！

---

### 🔹 多组测试数据（直到文件结束 EOF）
```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    // 方式1：读整数直到 EOF
    while (cin >> n) {
        cout << "Read: " << n << "\n";
    }

    // 方式2：读字符串行直到 EOF
    // string line;
    // while (getline(cin, line)) {
    //     cout << "Line: " << line << "\n";
    // }
    return 0;
}
```
**输入示例（Linux/Mac 终端按 Ctrl+D，Windows 按 Ctrl+Z）**：  
```
10
20
30
^D
```

---

## 2️⃣ 常用容器（STL）

> ✅ 所有容器均在 **C++ 标准模板库（STL）** 中，性能高、用法简单。

### 🔸 `vector` — 动态数组（对标 Java `ArrayList`）

**头文件**：`#include <vector>`

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;

    // 添加元素
    v.push_back(10);
    v.push_back(20);
    v.push_back(30);

    // 访问元素
    cout << "Size: " << v.size() << "\n"; // 3
    cout << "First: " << v[0] << "\n";    // 10

    // 遍历（C++11 范围 for）
    for (int x : v) {
        cout << x << " ";
    }
    cout << "\n"; // 输出: 10 20 30

    // 删除最后一个
    v.pop_back();

    // 初始化
    vector<int> v2 = {1, 2, 3};       // 列表初始化
    vector<int> v3(5, 0);             // 5个0: [0,0,0,0,0]
    return 0;
}
```

---

### 🔸 `unordered_map` — 哈希表（对标 Java `HashMap`）

**头文件**：`#include <unordered_map>`

```cpp
#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    unordered_map<string, int> score;

    // 插入/修改
    score["Alice"] = 95;
    score["Bob"] = 88;

    // 查询是否存在
    if (score.count("Alice")) {
        cout << "Alice's score: " << score["Alice"] << "\n";
    }

    // 遍历
    for (auto& p : score) { // p 是 pair<string, int>
        cout << p.first << ": " << p.second << "\n";
    }

    // 删除
    score.erase("Bob");
    return 0;
}
```

> ✅ **机考首选**：`unordered_map`（无序，O(1) 平均操作）  
> ❌ 避免 `map`（有序红黑树，O(log n)，除非题目要求排序）

---

### 🔸 `unordered_set` — 哈希集合（对标 Java `HashSet`）

**头文件**：`#include <unordered_set>`

```cpp
#include <iostream>
#include <unordered_set>
#include <string>
using namespace std;

int main() {
    unordered_set<string> seen;

    seen.insert("apple");
    seen.insert("banana");

    if (seen.count("apple")) {
        cout << "apple is in set\n";
    }

    seen.erase("banana");
    return 0;
}
```

---

### 🔸 `priority_queue` — 优先队列（最大堆）

**头文件**：`#include <queue>`

```cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    priority_queue<int> pq; // 默认最大堆

    pq.push(10);
    pq.push(30);
    pq.push(20);

    cout << "Top: " << pq.top() << "\n"; // 30
    pq.pop(); // 删除30

    // 最小堆：priority_queue<int, vector<int>, greater<int>> pq;
    return 0;
}
```

---

## 3️⃣ 字符串处理

### 🔹 头文件
```cpp
#include <string>    // string, getline
#include <cctype>    // isdigit, tolower 等（可选）
```

### 🔹 基本操作
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "Hello World";

    // 长度
    cout << "Length: " << s.length() << "\n"; // 11

    // 子串：substr(起始位置, 长度)
    string sub = s.substr(6, 5); // "World"
    cout << "Substr: " << sub << "\n";

    // 遍历
    for (char c : s) {
        cout << c << " ";
    }
    cout << "\n";

    // 拼接
    string a = "Hello", b = "World";
    string c = a + " " + b; // "Hello World"

    return 0;
}
```

---

### 🔹 类型转换（机考高频！）

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    // string → int/double
    string numStr = "123";
    int n = stoi(numStr);        // 123
    double d = stod("3.14");     // 3.14

    // int/double → string
    string s1 = to_string(42);   // "42"
    string s2 = to_string(3.14); // "3.14"

    cout << "n=" << n << ", d=" << d << "\n";
    cout << "s1=" << s1 << ", s2=" << s2 << "\n";
    return 0;
}
```

> ✅ **机考必备**：`stoi`, `stod`, `to_string`

---

## 4️⃣ 常用头文件汇总

| 功能      | 头文件            | 说明                      |
| --------- | ----------------- | ------------------------- |
| 输入输出  | `<iostream>`      | `cin`, `cout`             |
| 字符串    | `<string>`        | `string`, `getline`       |
| 动态数组  | `<vector>`        | `vector`                  |
| 哈希表    | `<unordered_map>` | `unordered_map`           |
| 哈希集合  | `<unordered_set>` | `unordered_set`           |
| 排序/算法 | `<algorithm>`     | `sort`, `min`, `max`      |
| 优先队列  | `<queue>`         | `priority_queue`          |
| 数学函数  | `<cmath>`         | `sqrt`, `pow`（机考少用） |
| 类型转换  | `<string>`        | `stoi`, `to_string` 等    |

> ✅ **机考万能头文件组合**：
> ```cpp
> #include <iostream>
> #include <vector>
> #include <string>
> #include <unordered_map>
> #include <unordered_set>
> #include <algorithm>
> using namespace std;
> ```

---

## 🔧 补充：结构体（Struct）— 表示对象

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int id;
    double score;
};

int main() {
    Student s;
    s.name = "Alice";
    s.id = 1001;
    s.score = 95.5;

    vector<Student> students;
    students.push_back(s);

    // 通过 ID 快速查找
    unordered_map<int, Student> db;
    db[s.id] = s;

    if (db.count(1001)) {
        cout << "Found: " << db[1001].name << "\n";
    }
    return 0;
}
```

---

## 🔧 补充：排序（`sort`）

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {3, 1, 4, 1, 5};

    // 升序
    sort(v.begin(), v.end());

    // 降序
    sort(v.rbegin(), v.rend());

    // 自定义排序（按绝对值）
    sort(v.begin(), v.end(), [](int a, int b) {
        return abs(a) < abs(b);
    });

    for (int x : v) cout << x << " ";
    return 0;
}
```

---

## 🧪 完整机考模板（建议背下）

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false); // 加速 cin/cout（可选）
    cin.tie(nullptr);

    int n;
    cin >> n;
    cin.ignore(); // 如果下一行用 getline

    unordered_map<int, string> db;
    for (int i = 0; i < n; i++) {
        int id;
        string name;
        cin >> id;
        cin.ignore();
        getline(cin, name);
        db[id] = name;
    }

    int q;
    cin >> q;
    while (q--) {
        int id;
        cin >> id;
        if (db.count(id)) {
            cout << db[id] << "\n";
        } else {
            cout << "Not Found\n";
        }
    }

    return 0;
}
```


