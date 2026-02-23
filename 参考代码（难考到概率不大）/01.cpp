#include <iostream>
#include <string>
using namespace std;
const int maxn=10010;
struct Worker{
    int uid;
    int type;
    int pos;
    //0休息否则oid
    int size;
    //已完成的订单
}worker[maxn];
struct File{
    int oid;
    int priority;
    int time;
    int type;
    int pos;
    //1已完成2尚未处理3正被处理4丢弃
    int fin;//完成的顺序
    int reachtime;//完成时间
    int uid;//铁匠的下标
}file[maxn];
int num,limit,n,cnt;
string str;
int main(){
    cin>>num>>limit;
    for(int i=1;i<=num;i++){
        cin>>worker[i].uid>>worker[i].type;
        worker[i].pos=0;
    }
    cin>>n;
    for(int i=0;i<=n-1;i++){
        for(int j=1;j<=cnt;j++){
            if(file[j].reachtime==i){
                worker[file[j].uid].size++;
                file[j].fin=worker[file[j].uid].size;
                file[j].pos=1;
                worker[file[j].uid].pos=0;
            }
        }
        for(int j=1;j<=num;j++){
            if(worker[j].pos==0){
                int vis=-1;
                for(int k=1;k<=cnt;k++){
                    if(file[k].pos==2&&file[k].type==worker[j].type){
                        if(vis==-1) vis=k;
                        else{
                            if(file[k].priority>file[vis].priority) vis=k;
                        }
                    }
                }
                if(vis!=-1){
                    file[vis].pos=3;
                    file[vis].reachtime=i+file[vis].time;
                    worker[j].pos=vis;
                    file[vis].uid=j;
                }
            }
        }
        cin>>str;
        if(str=="add"){
            cnt++;
            cin>>file[cnt].oid>>file[cnt].priority>>file[cnt].time>>file[cnt].type;
            file[cnt].pos=2;
            int cur=0;
            int vis=-1;
            for(int j=1;j<=cnt-1;j++){
                if(file[j].pos==2)
                {
                    cur++;
                    if(vis==-1) vis=j;
                    else{
                        if(file[j].priority<file[vis].priority) vis=j;
                    }
                }
            }
            if(cur>=limit){
                file[vis].pos=4;
            }
        }
        else if(str=="queryUser"){
            int Uid;
            cin>>Uid;
            for(int j=1;j<=num;j++){
                if(worker[j].uid==Uid){
                    if(worker[j].pos==0){
                        cout<<"worker "<<Uid<<" resting"<<endl;
                    }
                    else{
                        cout<<"worker "<<Uid<<" doing order "<<file[worker[j].pos].oid<<endl;
                    }
                }
            }
        }
        else if(str=="queryOrder"){
            int Oid;
            cin>>Oid;
            for(int j=1;j<=cnt;j++){
                if(file[j].oid==Oid){
                    if(file[j].pos==1){
                        cout<<"order "<<file[j].oid<<" done"<<endl;
                    }
                    else if(file[j].pos==2){
                        cout<<"order "<<file[j].oid<<" pending"<<endl;
                    }
                    else if(file[j].pos==3){
                        cout<<"order "<<file[j].oid<<" doing"<<endl;
                    }
                    else if(file[j].pos==4){
                        cout<<"order "<<file[j].oid<<" discarded"<<endl;
                    }
                }
            }
        }
        else if(str=="queryOrders"){
            int Uid;
            cin>>Uid;
            for(int j=1;j<=num;j++){
                if(worker[j].uid==Uid){
                    for(int t=1;t<=worker[j].size;t++){
                        for(int k=1;k<=cnt;k++){
                            if(file[k].uid==Uid&&file[k].pos==1&&file[k].fin==t){
                                if(k==1) cout<<file[k].oid;
                                else cout<<" "<<file[k].oid;
                                break;
                            }
                        }
                    }
                }
            }
            cout<<endl;
        }
    }
    return 0;
}