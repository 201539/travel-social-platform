#include<iostream>
#include<string.h>
#include<limits>
using namespace std;
#define INT_MAX numeric_limits<int>::max()

class Worker{
public:
    int uid;
    int type;
    string doneWeapon;
    int doing; // -1 (resting) >0 武器在weapons中的索引
    
    Worker(){}
    Worker(int uid, int type){
        this->uid = uid;
        this->type = type;
        this->doneWeapon = "";
        this->doing = -1;// 初始休息
    }
};

class Weapon{
public:
    int oid;
    int priority;
    int time;
    int type;
    
    int state; // 0(pending) -1(discard) 1(doing) 2(done)
    int restTime;
    
    Weapon(){}
    Weapon(int oid, int priority, int time, int type){
        this->oid = oid;
        this->priority = priority;
        this->time = time;
        this->type = type;
        
        this->state = 0; // 初始等待
        this->restTime = time;
    }
};

// return 一个 weapons中的索引
int selectNextOid(Weapon * weapons, int num, int type){
    int idx = -1;
    int priority = -1;
    for(int i = 0; i < num; i++){
        if(weapons[i].state == 0 && weapons[i].type == type){ // pending 且 类型匹配
            if(weapons[i].priority > priority){
                idx = i;
                priority = weapons[i].priority;
            }
        }
    }
    return idx;
}

int uidToidx(int uid,Worker * workers, int num){
    for(int i = 0; i < num; i++){
        if(uid == workers[i].uid){
            return i;
        }
    }
    return -1;
}

int oidToidx(int oid, Weapon * weapons, int num){
    for(int i = 0; i < num; i++){
        if(oid == weapons[i].oid){
            return i;
        }
    }
    return -1;
}

// void test(Weapon * weapons, Worker *workers);

// 1、铁匠 type 唯一
// 2、

int main(){
    int num = 0; int limit = 0;
    cin >> num >> limit;
    Worker * workers = new Worker[num];
    int i = 0;
    while(i < num){
        int uid; int type;
        cin >> uid >> type;
        Worker w(uid,type);
        workers[i] = w;
        i++;
    }
    
    int N;
    cin >> N;
    int weapon_num = 0;
    int pending_num = 0;
    int time = 0; // 标识时间
    Weapon * weapons = new Weapon[N];
    while(N > 0){
        // 调度
        for(int i = 0; i < num; i++){
            if(workers[i].doing == -1){ // 空闲
                int t = workers[i].type;
                int idx = selectNextOid(weapons, weapon_num,t); //挑选下一个weapon
                // cout << "idx:" << idx << endl;
                if(idx != -1){ // 存在可给该铁匠的武器
                    workers[i].doing = idx; // 工人状态改为doing
                    weapons[idx].state = 1; // 武器状态改为doing
                    pending_num --;
                }
            }else { // 铁匠在工作
                Weapon * w = &(weapons[workers[i].doing]);
                w->restTime --;
                if(w->restTime == 0){ // 工作完成
                    w->state = 2;
                    workers[i].doneWeapon += to_string(w->oid) + " ";
                    // 再次分配
                    int idx = selectNextOid(weapons, weapon_num,workers[i].type); //挑选下一个weapon
                    if(idx != -1){ // 存在可给该铁匠的武器
                        workers[i].doing = idx;
                        weapons[idx].state = 1; // 武器状态改为doing
                        pending_num --;
                    } else{
                        workers[i].doing = -1; // 工人状态改为resting
                    }
                }
            }
        }
        // 读取命令、处理命令
        string cmd;
        cin >> cmd;
        if(cmd == "add"){
            int oid; int priority; int time; int type;
            cin >> oid >> priority >> time >> type;
            Weapon w(oid, priority, time, type);
            weapons[weapon_num ++] = w;
            // 达到上限后，处理
            if(pending_num == limit){
                int p = INT_MAX;
                int idx = -1;
                for(int i = 0; i < weapon_num-1; i++){
                    if(weapons[i].state == 0){
                        if(weapons[i].priority < p){
                            p = weapons[i].priority;
                            idx = i;
                        }
                    }
                }
                weapons[idx].state = -1;
            }else {
                pending_num ++;
            }
        } else if(cmd == "queryUser"){
            int uid;
            cin >> uid;
            int widx = uidToidx(uid, workers, num);
            int oidx = workers[widx].doing;
            if(oidx == -1){
                cout << "worker " << uid << " resting" << endl;
            } else{
                cout << "worker " << uid << " doing order " << weapons[oidx].oid << endl;
            }
        } else if (cmd == "queryOrder"){
            int oid;
            cin >> oid;
            int oidx = oidToidx(oid,weapons,weapon_num);
            switch(weapons[oidx].state){
                case -1:{
                    cout << "order " << oid << " discarded" << endl;
                    break;
                }
                case 0:{
                    cout << "order " << oid << " pending" << endl;
                    break;
                }
                case 1:{
                    cout << "order " << oid << " doing" << endl;
                    break;
                }
                case 2:{
                    cout << "order " << oid << " done" << endl;
                    break;
                }
            }
        } else if(cmd == "queryOrders"){
            int uid;
            cin >> uid;
            int widx = uidToidx(uid,workers,num);
            string done = workers[widx].doneWeapon;
            int len = strlen(done.c_str());
            cout << done.substr(0,len-1) << endl;
        } else{
            cout << "Invalid cmd" << endl;
        }
        N--;
        time++;
    }
}