#include <iostream>
#include <cassert>
#include <string>

using namespace std;

/*      data structure        */
struct node {
    int oid;
    int priority;
    int time; //cost time
    int type;
    struct node *next;
    struct node *prev;
};
typedef struct node node_t;

struct list {
    int n_nodes;
    node_t *head;
    node_t *rear;
};
typedef struct list list_t;

enum {RESTING = 0, WORKING};

struct worker {
    int uid;
    int type; //distinct
    int state;
    node_t *order;
};
typedef struct worker worker_t;

/*      global variable         */
#define N 1010
//worker
worker_t *workers;
int n_workers = 0, n_limit;
//order
list_t *buffering, *pending, *completed, *discarded; 

void list_make(list_t *list);
void list_push_back(list_t *list, node_t *node);
node_t *list_find_lowest(list_t *list);
node_t *list_find_highest(list_t *list, int type);
void list_remove(list_t *list, node_t *node);
void init_workers(int num);
void init_orders();
void schedule();
void dispatch();
worker_t *find_worker_uid(int uid);
node_t *find_order_oid(list_t *list, int oid);
void find_order_uid(list_t *list, int uid);

int main() {
    cin >> n_workers >>n_limit;
    
    init_workers(n_workers);
    init_orders();
    /*      read in workers        */
    for (int i = 0; i < n_workers; i++) {
        int uid, type;
        cin >> workers[i].uid >> workers[i].type;
        workers[i].state = RESTING;
        workers[i].order = nullptr;
    }
    
    int n;
    cin >> n;
    while (n--) {
        
        schedule();
        
        dispatch();
        
    }
    
}

/*  list operation    */
void list_make(list_t *list) {
    assert(list != nullptr);
    list->head = new node_t();
    list->rear = new node_t();
    assert(list->head != nullptr && list->rear != nullptr);
    list->head->prev = nullptr;
    list->head->next = list->rear;
    list->rear->next = nullptr;
    list->rear->prev = list->head;
    list->n_nodes = 0;
}

void list_push_back(list_t *list, node_t *node) {
    assert(list != nullptr && node != nullptr);
    node->next = list->rear;
    node->prev = list->rear->prev;
    
    list->rear->prev->next = node;
    list->rear->prev = node;
    
    list->n_nodes++;
}

node_t *list_find_lowest(list_t *list) {
    node_t *ans = nullptr;
    for (node_t *itr = list->head->next; itr != list->rear; itr = itr->next) {
        if (ans == nullptr || itr->priority < ans->priority) {
            ans = itr;
        }
    }
    return ans;
}

node_t *list_find_highest(list_t *list, int type) {
    node_t *ans = nullptr;
    for (node_t *itr = list->head->next; itr != list->rear; itr = itr->next) {
        if (type == itr->type && (ans == nullptr || itr->priority > ans->priority)) {
            ans = itr;
        }
    }
    return ans;
}

void list_remove(list_t *list, node_t *node) {
    for (node_t *itr = list->head->next; itr != list->rear; itr = itr->next) {
        if (itr == node) {
            itr->prev->next = itr->next;
            itr->next->prev = itr->prev;
            list->n_nodes--;
            return ;
        }
    }
    assert(0);
}

/*      logic        */
void init_workers(int num) {
    workers = new worker_t[num];
    assert(workers != nullptr);
}

void init_orders() {
    buffering = new list_t();
    list_make(buffering);
    pending = new list_t();
    list_make(pending);
    completed = new list_t();
    list_make(completed);
    discarded = new list_t();
    list_make(discarded);
}

void schedule() {
    //update workers' status
    for (int i = 0; i < n_workers; i++) {
        worker_t *cur = &workers[i];
        if (cur->state == WORKING) {
            assert(cur->order != nullptr);
            cur->order->time--;
            if (cur->order->time == 0) {
                list_remove(pending, cur->order);
                list_push_back(completed, cur->order);
                cur->order = nullptr;
                cur->state = RESTING;
            }
        }
    }
    //find next order
    for (int i = 0; i < n_workers; i++) {
        worker_t *cur = &workers[i];
        if (cur->state == RESTING) {
            node_t *task = list_find_highest(buffering, cur->type);
            if (task != nullptr) { //find some avaliable task.
                cur->order = task;
                cur->state = WORKING;
                list_remove(buffering, task);
                list_push_back(pending, task);
            }
        }
    }
}

void dispatch() {
    string cmd;
    cin >> cmd;
    if (cmd == "add") {
        node_t *task = new node_t();
        cin >> task->oid >> task->priority >> task->time >> task->type;
        if (buffering->n_nodes == n_limit) {
            node_t *rm = list_find_lowest(buffering);
            list_remove(buffering, rm);
            list_push_back(discarded, rm);
        }
        list_push_back(buffering, task);
    } else if (cmd == "queryUser") {
        int uid;
        cin >> uid;
        worker_t *w = find_worker_uid(uid);
        if (w->state == RESTING) {
            cout << "worker " << uid << " resting" << endl; 
        } else {
            cout << "worker " << uid << " doing order " << w->order->oid << endl;
        }
    } else if (cmd == "queryOrder") {
        int oid;
        cin >> oid;
        if (find_order_oid(completed, oid)) {
            cout << "order " << oid <<" done" <<endl;
        } else if (find_order_oid(buffering, oid)) {
            cout << "order " << oid << " pending" <<endl;
        } else if (find_order_oid(pending, oid)) {
            cout << "order " << oid << " doing" <<endl;
        } else if (find_order_oid(discarded, oid)) {
            cout << "order " << oid << " discarded" <<endl;
        }
    } else if (cmd == "queryOrders") {
        int uid;
        cin >> uid;
        find_order_uid(completed, uid);
    } else {
        assert(0);
    }
}

worker_t *find_worker_uid(int uid) {
    for (int i = 0; i < n_workers; i++) {
        if (workers[i].uid == uid) {
            return &workers[i];
        }
    }
    assert(0);
}

node_t *find_order_oid(list_t *list, int oid) {
    for (node_t *itr = list->head->next; itr != list->rear; itr = itr->next) {
        if (itr->oid == oid) {
            return itr;
        }
    }
    return nullptr;
}

void find_order_uid(list_t *list, int uid) {
    int type = find_worker_uid(uid)->type;
    string output = "";
    for (node_t *itr = list->head->next; itr != list->rear; itr = itr->next) {
        if (itr->type == type) {
            output += to_string(itr->oid) + " ";
        }
    }
    if (output.size() > 0) {
        output[output.size() - 1] = '\n';
        cout << output;
    } else {
        cout << endl;
    }
}
