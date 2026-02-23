#include<iostream>
using namespace std;
// order status
#define DOING 0
#define DONE 1
#define PENDING 2
#define DISCARDED 3
struct Order{
    int oid;
    int priority;
    int time;
    int type;
    int order_status;
};
struct Worker{
    int uid;
    int type;
    int work_status;// 0表示rest，其他值表示正在处理这个order
    Order *order;// 持有的这个订单,work_status时为nullptr
    int remian_time;// 存储当前任务还需要花多久才完成，当work_status == 0 无意义
    int done_num; // 存储已经完成的订单数目
    int *done_order;// 存储已经完成的订单oid
};
void process_order(Worker **workers, Order **orders,
                    int& pending_num, const int limit, int& order_sum, const int num){// 调度
    for(int i = 0; i < num; i++){
        Worker *worker = workers[i];
        
        if(worker->work_status > 0){// 有任务
            worker->remian_time -= 1;
            if(worker->remian_time == 0){// 当前任务完成
                worker->order->order_status = DONE;
                worker->work_status = 0;
                worker->done_order[worker->done_num] = worker->order->oid;
                worker->done_num += 1;
                worker->order = nullptr;
            }
        }
        
        if(worker->work_status == 0){// 没任务
            if(pending_num > 0){
                int priority = 0;
                Order *order = nullptr;
                for(int j = 0; j < order_sum; j++){
                    if(orders[j]->order_status == PENDING && orders[j]->type == worker->type && orders[j]->priority > priority){
                        order = orders[j];
                        priority = orders[j]->priority;
                    }
                }
                if(order != nullptr){
                    pending_num -= 1;
                    order->order_status = DOING;
                    worker->work_status = order->oid;
                    worker->order = order;
                    worker->remian_time = order->time;
                }
            }
        }
    }
}
void add(Order **orders, int& pending_num, const int limit, int& order_sum,
            int oid, int priority, int time, int type){
    Order *order = new Order;
    order->oid = oid;
    order->priority = priority;
    order->time = time;
    order->type = type;
    order->order_status = PENDING;
    orders[order_sum] = order;
    order_sum++;// 一定先加入全部order的数组
    
    if(pending_num < limit){
        pending_num++;
    }
    else{
        int to_discard_priority = INT32_MAX;
        Order *to_discard_order = nullptr;
        for(int i = 0; i < order_sum-1; i++){
            if(orders[i]->order_status == PENDING && orders[i]->priority < to_discard_priority){
                to_discard_order = orders[i];
                to_discard_priority = orders[i]->priority;
            }
        }
        to_discard_order->order_status = DISCARDED;
    }
}
void queryUser(Worker **workers, int uid, int num){
    Worker *worker;
    for(int i = 0; i < num; i++){
        if(workers[i]->uid == uid){
            worker = workers[i];
            break;
        }
    }
    if(worker->work_status == 0){
        cout << "worker " << uid << " resting" << endl;
    }
    else{
        cout << "worker " << uid << " doing order " << worker->work_status << endl;
    }
}
void queryOrder(Order **orders,const int oid,const int order_sum){
    Order *order;
    for(int i = 0; i < order_sum; i++){
        if(orders[i]->oid == oid){
            order = orders[i];
            break;
        }
    }
    cout << "order " << oid;
    switch(order->order_status){
        case DOING:
            cout << " doing" << endl;
            break;
        case DONE:
            cout << " done" << endl;
            break;
        case PENDING:
            cout << " pending" << endl;
            break;
        case DISCARDED:
            cout << " discarded" << endl;
            break;
    }
}
void queryOrders(Worker **workers, int uid, int num){
    Worker *worker;
    for(int i = 0; i < num; i++){
        if(workers[i]->uid == uid){
            worker = workers[i];
            break;
        }
    }
    for(int i = 0; i < worker->done_num; i++){
        if(i != worker->done_num-1){
            cout << worker->done_order[i] << " ";
        }
        else{
            cout << worker->done_order[i];
        }
    }
    cout << endl;
}
int main(){
    int num,limit;
    cin >> num >> limit;
    Worker **workers = new Worker*[num];
    Order **orders = new Order*[1000];
    int pending_num = 0;// 要记录当前暂存了多少件，便于丢弃
    int order_sum = 0;// 所有的order总数
    
    for(int i = 0; i < num; i++){
        Worker* w = new Worker;
        int uid,type;
        cin >> uid >> type;
        w->uid = uid;
        w->type = type;
        w->work_status = 0;
        w->order = nullptr;
        w->remian_time = 0;
        w->done_num = 0;
        w->done_order = new int[1000];
        workers[i] = w;
    }
    
    int N;
    string instr;
    cin >> N;
    while(N > 0){
        process_order(workers, orders, pending_num, limit, order_sum, num);
        cin >> instr;
        if(instr == "add"){
            int oid,priority,time,type;
            cin >> oid >> priority >> time >> type;
            add(orders, pending_num, limit, order_sum, oid, priority, time, type);
        }
        else if(instr == "queryUser"){
            int uid;
            cin >> uid;
            queryUser(workers, uid, num);
        }
        else if(instr == "queryOrder"){
            int oid;
            cin >> oid;
            queryOrder(orders, oid, order_sum);
        }
        else if(instr == "queryOrders"){
            int uid;
            cin >> uid;
            queryOrders(workers, uid, num);
        }
        N--;
    }
}