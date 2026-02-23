#include <iostream>
#include <optional>

using std::optional;

template <typename T>
class ArrayList {
private:
    T *array;
    int size;
    int capacity;

    // 扩容
    void resize() {
        capacity = capacity + (capacity / 2);
        T *newArray = new T[capacity];
        for (int i = 0; i < size; ++i)
            newArray[i] = array[i];

        delete[] array;
        array = newArray;
    }

public:
    ArrayList() : size(0), capacity(10) {
        array = new T[capacity];
    }

    void add(T &x) {
        if (size >= capacity)
            resize();
        array[size++] = x;
    }

    void remove(T &x) {
        for (int i = 0; i < size; ++i) {
            if (array[i] == x) {
                for (int j = i; j < size - 1; ++j)
                    array[j] = array[j + 1];
                --size;
                return;
            }
        }
    }

    optional<T> get(int x) {
        if (x < 0 || x >= size)
            return std::nullopt;

        return array[x];
    }

    int getSize() {
        return size;
    }

    int getCapacity() {
        return capacity;
    }
};