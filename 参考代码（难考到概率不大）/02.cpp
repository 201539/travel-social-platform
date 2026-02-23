#include <iostream>
#include <cstdio>
#include <cstring>
#include <climits>

#define MAX_WORKER 1000
#define MAX_LIST 1000
#define MAX_ORDER 100000

int num;
int limit;
int N;

static struct Worker {
    int uid;
    int type;
    
    int order_id;
    int order_index;
    int avai_time;
    
    int finish_order_list[MAX_LIST];
    int finish_order_list_index;
} workers[MAX_WORKER];

enum { PENDING = 0, DONE, DOING, DISCARDED };

static struct Order {
    int oid;
    int priority;
    int order_time;
    int type;
    int state;
} orders[MAX_ORDER];

static char cmd[128];
int oid, priority, order_time, type, uid;

static int curr_order_index;
static int pending_orders_count;

void add_order(int oid, int priority, int order_time, int type) {
    if (pending_orders_count == limit) {
        int target_priority = INT_MAX;
        int target_index = -1;
        for (int i = 0 ; i < curr_order_index; ++i) {
            if (orders[i].priority < target_priority && orders[i].state == PENDING) {
                target_priority = orders[i].priority;
                target_index = i;
            }
        }
        
        orders[target_index].state = DISCARDED;
        
        orders[curr_order_index].oid = oid;
        orders[curr_order_index].priority = priority;
        orders[curr_order_index].order_time = order_time;
        orders[curr_order_index].type = type;
        orders[curr_order_index].state = PENDING;
        
        curr_order_index++;
    } else {
        orders[curr_order_index].oid = oid;
        orders[curr_order_index].priority = priority;
        orders[curr_order_index].order_time = order_time;
        orders[curr_order_index].type = type;
        orders[curr_order_index].state = PENDING;
        
        pending_orders_count++;  
        curr_order_index++;
    }

}

void queryUser(int uid) {
    for (int i = 0 ; i < num; ++i) {
        if (workers[i].uid == uid) {
            if (workers[i].avai_time == -1) {
                printf("worker %d resting\n", uid);
            } else {
                printf("worker %d doing order %d\n", uid, workers[i].order_id);
            }
        }
    }
}

void queryOrder(int oid) {
    for (int i = 0 ; i < curr_order_index; ++i) {
        if (orders[i].oid == oid) {
            switch (orders[i].state) {
                case PENDING:
                    printf("order %d pending\n", oid);
                    break;
                case DONE:
                    printf("order %d done\n", oid);
                    break;
                case DOING:
                    printf("order %d doing\n", oid);
                    break;
                case DISCARDED:
                    printf("order %d discarded\n", oid);
                    break;
            }
        }
    }
}

void queryOrders(int uid) {
    for (int i = 0 ; i < num; ++i) {
        if (workers[i].uid == uid) {
            for (int j = 0 ; j < workers[i].finish_order_list_index; ++j) {
                printf("%d ", workers[i].finish_order_list[j]);
            }
        }
    }
    printf("\n");
}

int select_order(int type) {
    int target_priority = INT_MIN;
    int target_index = -1;
    
    for (int i = 0 ; i < curr_order_index; ++i) {
        Order target_order = orders[i];
        if (target_order.state == PENDING && target_order.type == type &&
            target_order.priority > target_priority) {
            target_priority = target_order.priority;
            target_index = i;
        }
    }
    
    return target_index;
}

void logic(int curr_time) {
    if (curr_time == 0) {
        return;
    }
    
    for (int i = 0; i < num; ++i) {
        if (workers[i].avai_time == curr_time || workers[i].avai_time == -1) {
            if (workers[i].avai_time == curr_time) {
                workers[i].finish_order_list[workers[i].finish_order_list_index] = workers[i].order_id;
                workers[i].finish_order_list_index++;
                
                orders[workers[i].order_index].state = DONE; // intro order_index
            }
            
            int order_index = select_order(workers[i].type);
            if (order_index != -1) {
                workers[i].avai_time = curr_time + orders[order_index].order_time;
                workers[i].order_id = orders[order_index].oid;
                workers[i].order_index = order_index;
                
                orders[order_index].state = DOING;
                pending_orders_count--;
            } else {
                workers[i].avai_time = -1;
                workers[i].order_id = -1;
                workers[i].order_index = -1;
            }
        }
    }
}


int main() {
    scanf("%d %d", &num, &limit);
    for (int i = 0; i < num; ++i) {
        scanf("%d %d", &workers[i].uid, &workers[i].type);
        workers[i].order_id = -1;
        workers[i].avai_time = -1;
        workers[i].order_index = -1;
    }
    scanf("%d", &N);
    for (int i = 0; i < N; ++i) {
        logic(i);
        
        scanf("%s", cmd);
        if (!strcmp(cmd, "add")) {
            scanf("%d %d %d %d", &oid, &priority, &order_time, &type);
            // printf("%d %d %d %d\n", oid, priority, order_time, type);
            add_order(oid, priority, order_time, type);
        } else if (!strcmp(cmd, "queryUser")) {
            scanf("%d", &uid);
            // printf("%d\n", uid);
            queryUser(uid);
        } else if (!strcmp(cmd, "queryOrder")) {
            scanf("%d", &oid);
            // printf("%d\n", oid);
            queryOrder(oid);
        } else if (!strcmp(cmd, "queryOrders")) {
            scanf("%d", &uid);
            // printf("%d\n", uid);
            queryOrders(uid);
        }
    }
}