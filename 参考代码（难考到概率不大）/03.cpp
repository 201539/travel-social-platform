#include <iostream>
using namespace std;

class Order{
public:
    int oid;
    int priority;
    int needTime;
    int type;
    int forgeTime;
    int state;//0:pending,1:doing,2:done,3:discarded
    Order(int oid,int priority,int needTime,int type):oid(oid),priority(priority),needTime(needTime),type(type){
        forgeTime=0;
        state=0;
    }
    Order (){}
    void output(){
        if(state==0){
            cout<<"order "<<oid<<" "<<"pending"<<"\n";
        }else if(state ==1){
            cout<<"order "<<oid<<" "<<"doing"<<"\n";
        }else if(state==2){
            cout<<"order "<<oid<<" "<<"done"<<"\n";
        }else if(state==3){
            cout<<"order "<<oid<<" "<<"discarded"<<"\n";
        }
    }
    void startdoing(){
        state=1;
    }
    
    
};
int findOrder(Order order[],int oid,int numOfOrders);
int findOrderWithType(Order order[],int type,int numOfOrders);

class Forger{
public:
    int finish[100];
    int finishNum;
    int uid;
    int type;
    int state;//-1:waiting;>0:doing oid
    Forger(int uid,int type):uid(uid),type(type){
        finishNum=0;
        state=-1;
    }
    Forger(){}
    void outPut(){
        if(state==-1){
            cout<<"worker "<<uid<<" resting"<<"\n";
        }else{
            cout<<"worker "<<uid<<" doing order "<<state<<"\n";
        }
    }
    void outPutRe(){
        if(finishNum==0){
            cout<<"\n";
        }else{
            for(int i=0;i<finishNum-1;i++){
                cout<<finish[i]<<" ";
            }
            cout<<finish[finishNum-1]<<"\n";
        }
    }
    void whetherKeepForge(Order order[],int numOfOrders){
        if(state!=-1){
            int orderIndex = findOrder(order,state,numOfOrders);//index
            order[orderIndex].forgeTime++;
            //判断此订单是否完成
            if(order[orderIndex].forgeTime==order[orderIndex].needTime){
                order[orderIndex].state=2;
                finish[finishNum]=state;
                finishNum++;
                //继续寻找下一个符合type的订单
                int start = findOrderWithType(order,type,numOfOrders);//oid
                //无下一个
                if(start==-1)
                    state=-1;
                else{
                    state=start;
                    order[findOrder(order,state,numOfOrders)].startdoing();
                }
            }
        }else{
             //继续寻找下一个符合type的订单
                int start = findOrderWithType(order,type,numOfOrders);//oid
                //无下一个
                if(start==-1)
                    state=-1;
                else{
                    state=start;
                    order[findOrder(order,state,numOfOrders)].startdoing();
                }
        }
    }
    
};


int findIndexOfForger(Forger forgers[],int uid,int numOfForger){
    for(int i=0;i<numOfForger;i++){
        if(forgers[i].uid==uid)
            return i;
    }
    return -1;
}
void dowork(Forger forgers[],int numOfForger,Order orders[],int numOfOrders){
    for(int i=0;i<numOfForger;i++){
        forgers[i].whetherKeepForge(orders,numOfOrders);
    }
}
int findOrder(Order order[],int oid,int numOfOrders){//index
        for(int i=0;i<numOfOrders;i++){
            if(order[i].oid==oid)
                return i;
        }
        return -1;
    }
int findOrderWithType(Order order[],int type,int numOfOrders){//oid
        bool first=true;
        int maxPr_oid=-1;
        for(int i=0;i<numOfOrders;i++){
            if(order[i].type==type&&order[i].state==0){
                if(first){
                    first=false;
                    maxPr_oid=order[i].oid;
                }else{
                    if(order[findOrder(order,maxPr_oid,numOfOrders)].priority<order[i].priority){
                        maxPr_oid = order[i].oid;
                    }
                }
            }
        }
        return maxPr_oid;
    }
int countValid(Order orders[],int numOfOrders){
    int valid=0;
    for(int i=0;i<numOfOrders;i++){
        if(orders[i].state==0){
            valid++;
        }
    }
    return valid;
}
void discardOne(Order orders[],int numOfOrders){
    int discardedOne=0;
    bool first=true;
    for(int i=0;i<numOfOrders;i++){
        if(orders[i].state==0){
            if(first){
                discardedOne=i;
                first=false;
            }else{
                if(orders[discardedOne].priority>orders[i].priority){
                    discardedOne=i;
                }
            }
        }
    }
    orders[discardedOne].state=3;
}

int main(){
    int numOfForger=0;
    int billLimit=0;
    cin>>numOfForger;
    cin>>billLimit;
    Forger forgers[numOfForger];
    for(int i=0;i<numOfForger;i++){
        int uid=0;
        int type=0;
        cin>>uid;
        cin>>type;
        Forger f(uid,type);
        forgers[i]=f;
    }
    int startTimeNum=0;
    cin>>startTimeNum;
    Order orders[startTimeNum];
    int numOfOrders=0;
    string cmd;
    for(int i=0;i<startTimeNum;i++){
        dowork(forgers,numOfForger,orders,numOfOrders);
        cin>>cmd;
        if(cmd=="queryUser"){
            int uid=0;
            cin>>uid;
            int index = findIndexOfForger(forgers,uid,numOfForger);
            forgers[index].outPut();
        }
        else if(cmd=="add"){
            int valid=countValid(orders,numOfOrders);
            if(valid==billLimit) discardOne(orders,numOfOrders);
            int oid=0,priority=0,needTime=0,type=0;
            cin>>oid;cin>>priority;cin>>needTime;cin>>type;
            Order o(oid,priority,needTime,type);
            orders[numOfOrders]=o;
            numOfOrders++;
            
        }
        else if(cmd=="queryOrder"){
            int oid=0;
            cin>>oid;
            int index = findOrder(orders,oid,numOfOrders);
            orders[index].output();
        }
        else if(cmd=="queryOrders"){
            int uid=0;
            cin>>uid;
            int index = findIndexOfForger(forgers,uid,numOfForger);
            forgers[index].outPutRe();
        }
    }
}