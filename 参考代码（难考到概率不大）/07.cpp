#include <iostream>
#include <cassert>
#include <limits>

using namespace std;

#define DEBUG(...)      cout << "DEBUG: " << __VA_ARGS__ << endl
#define LINK(A, B)      (B)->next = (A)->next; (A)->next = (B)
#define UNLINK(A, B)    (A)->next = (B)->next; (B)->next = nullptr

constexpr int UNSTARTED = 0;
constexpr int RUNNING = 1;
constexpr int COMPLETE = 2;
constexpr int ABORTED = 3;
constexpr int ORDER_MAX_N = 100;

int max_queue_n = 0;
int waiting_n = 0;

class Weapon {
public:
    int oid;
    int prio;
    int time;
    int type;
    
    Weapon(int _oid, int _prio, int _time, int _type):
        oid{_oid}, prio{_prio}, time{_time}, type{_type} {
            
    }
    
};

class WpNode {
public:
    Weapon *w;
    int status;
    
    WpNode *next;
    
    WpNode(Weapon *_w, int _status): w{_w}, status{_status}
    { 
        
    }
};

WpNode *nodes[ORDER_MAX_N];
int wpnode_n = 0;

WpNode *waiting_dhead;

class Smith {
public:
    int uid;
    int type;
    
    WpNode *running_dhead;
    WpNode *finished_dhead;
    
    Smith(int _uid, int _type): uid{_uid}, type{_type}
    {
        running_dhead = new WpNode(nullptr, UNSTARTED);
        finished_dhead = new WpNode(nullptr, UNSTARTED);
    }
    
    void work() {
        WpNode *nxt;
        
        if (now_working_on() != nullptr) {
            nxt = running_dhead->next;
            assert(nxt->w->time >= 0);
            if (nxt->w->time == 0) {
                nxt->status = COMPLETE;
                
                WpNode *cur = finished_dhead;
                while (cur->next != nullptr)
                    cur = cur->next;
                UNLINK(running_dhead, cur);
                LINK(cur, nxt);
                // DEBUG(nxt->w->oid << " finished");
            }
            
        }
        
        if (now_working_on() == nullptr) {
            nxt = waiting_dhead->next;
            WpNode *prenxt = waiting_dhead;
            if (nxt == nullptr) return;
            
            while (nxt != NULL && nxt->w->type != type) {
                prenxt = nxt;
                nxt = nxt->next;
            }
            
            if (nxt == NULL) return;
            
            WpNode *pre = waiting_dhead, *cur = pre->next;
            
            for (; cur != nullptr; pre = cur, cur = cur->next) {
                if (cur->w->type == type && cur->w->prio > nxt->w->prio) {
                    prenxt = pre;
                    nxt = cur;
                }
            }
            
            if (nxt == NULL) return;
            
            UNLINK(prenxt, nxt);
            LINK(running_dhead, nxt);
            nxt->status = RUNNING;
            waiting_n--;
        }
        
        Weapon &w = (*nxt->w);
        w.time--;
        
        // DEBUG(w.oid << " " << w.time);
    }
    
    void queryUser() {
        cout << "worker" << uid;
        Weapon *w = now_working_on();
        
        if (w == nullptr)
            cout << " resting";
        else
            cout << " doing order " << w->oid;
        
        cout << endl;
    }
    
    void add_work(Weapon *w) {
        if (waiting_n == max_queue_n) {
            if (waiting_dhead->next == nullptr) return;
            
            WpNode *min_node = waiting_dhead->next,
                    *cur = min_node->next;
            
            for (; cur != nullptr; cur = cur->next) {
                if (cur->w->prio < min_node->w->prio)
                    min_node = cur;
            }
            
            for (cur = waiting_dhead; cur->next != nullptr && cur->next != min_node; cur = cur->next);
            
            UNLINK(cur, min_node);
            
            // DEBUG(min_node->w->oid << " aborted");
            min_node->status = ABORTED;
            
            waiting_n--;
        }
        
        // DEBUG(w->oid << " accepted");
        
        WpNode *node = new WpNode(w, UNSTARTED);
        nodes[wpnode_n++] = node;
        assert(wpnode_n < ORDER_MAX_N);
        
        LINK(waiting_dhead, node);
        waiting_n++;
    }
    
    void work_finished() {
        WpNode *cur = finished_dhead->next;
        for (; cur != nullptr; cur = cur->next)
            cout << cur->w->oid << " ";
        cout << endl;
    }
    
private:
    Weapon* now_working_on() {
        WpNode *first = running_dhead->next;
        if (first == nullptr) return nullptr;
        return first->w;
    }
    
    
};



// -----------------------------

Smith **smith_a;
int smith_n;

Smith& find_smith(int uid) {
   for (int i = 0; i < smith_n; i++) {
        Smith &smith = (*smith_a[i]);
        if (smith.uid == uid) return smith;
    }
    assert(0);
}

Smith& find_smith_by_type(int type) {
   for (int i = 0; i < smith_n; i++) {
        Smith &smith = (*smith_a[i]);
        if (smith.type == type) return smith;
    }
    assert(0);
}

void smith_work() {
    for (int i = 0; i < smith_n; i++) {
        Smith &smith = (*smith_a[i]);
        smith.work();
    }
}

// add [oid] [priority] [time] [type]
void op_add() {
    int oid, prio, time, type;
    cin >> oid >> prio >> time >> type;
    Weapon *weapon = new Weapon(oid, prio, time, type);
    
    Smith &smith = find_smith_by_type(type);
    smith.add_work(weapon);
}

void op_quser() {
    int uid;
    cin >> uid;
    
    find_smith(uid).queryUser();
}

void op_qorder() {
    int oid;
    cin >> oid;
    
    cout << "order " << oid;
    
    for (int i = 0; i < wpnode_n; i++) {
        WpNode &wn = (*nodes[i]);
        if (wn.w->oid == oid) {
            switch (wn.status) {
                case UNSTARTED:
                    cout << " pending";
                    break;
                case RUNNING:
                    cout << " doing";
                    break;
                case COMPLETE:
                    cout << " done";
                    break;
                case ABORTED:
                    cout << " discarded";
                    break;
                default:
                    assert(0);
            }
            cout << endl;
            return;
        }
        // DEBUG(oid);
    }
    assert(0);
}

void op_qorders() {
    int uid;
    cin >> uid;
    
    Smith &smith = find_smith(uid);
    smith.work_finished();

}

void op_handle() {
    string cmd;
    cin >> cmd;
    
    if (cmd == "add")
        op_add();
    else if (cmd == "queryUser")
        op_quser();
    else if (cmd == "queryOrder")
        op_qorder();
    else if (cmd == "queryOrders")
        op_qorders();
    else{
        assert(0);
    }
}

int main() {
    cin >> smith_n >> max_queue_n;
    
    smith_a = new Smith*[smith_n];
    
    waiting_dhead = new WpNode(nullptr, UNSTARTED);
    
    for (int i = 0; i < smith_n; i++) {
        int uid, type;
        cin >> uid >> type;
        smith_a[i] = new Smith(uid, type);
    }
    
    int op_n;
    cin >> op_n;
    
    for (int i = 0; i < op_n; i++) {
        
        smith_work();
        op_handle();
        
    }
    
    return 0;
}