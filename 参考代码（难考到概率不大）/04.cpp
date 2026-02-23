#include <iostream>
#include <string>

// 兵器订单类
class Weapon {
private:
    int m_OId;
    int m_Priority;
    int m_Time;
    int m_Type;
public:
    Weapon(int oid, int priority, int time, int type)
        : m_OId(oid), m_Priority(priority), m_Time(time), m_Type(type)
    {}
    ~Weapon() = default;
    
    int GetId() const { return m_OId; }
    int GetType() const { return m_Type; }
    int GetPriority() const { return m_Priority; }
    int GetTime() const { return m_Time; }
    void DecreaseTime() { m_Time--; }
    bool isFinish() const { return m_Time == 0; }
    bool ComparePriority(const Weapon& weapon) const;
};

// 铁匠类
class IronMan {
private:
    int m_UId;
    int m_Type;
    bool m_IsBusy;
    int* m_FinishWeaponList; // 记录已经完成的weaponid
    int m_FinishIndex;
    Weapon* m_CurWeapon; // 当前手上的订单编号 如果没有的话为-1
public:
    IronMan(int uid, int type)
        : m_UId(uid), m_Type(type), m_FinishWeaponList(new int[1000]), m_FinishIndex(0), m_CurWeapon(nullptr), m_IsBusy(false)
    {}
    ~IronMan() { delete[] m_FinishWeaponList; }
    
    int GetType() const { return m_Type; }
    int GetUId() const { return m_UId; }
    int GetCurWeaponId();
    bool IsResting() const { return !m_IsBusy; }
    void DistributeWeapon(Weapon* weapon);
    void DoWork();
    void QueryFinishWeapon();
};

int IronMan::GetCurWeaponId()
{
    if (m_CurWeapon != nullptr)
    {
        return m_CurWeapon->GetId();
    }
    
    return -1;
}

bool Weapon::ComparePriority(const Weapon& weapon) const
{
    // 比较两个武器的优先级
    // 用于排序
    return m_Priority >= weapon.GetPriority();
}

// 订单列表类
class WeaponList {
private:
    int* m_DiscardList;
    Weapon** m_List; // 记录当前排队的订单列表
    int index; // 记录当前订单的数量
    int m_Size; // 记录当前订单的最大值
    int m_DiscardIndex;
public:
    WeaponList(int size)
        : m_Size(size), m_DiscardList(new int[1000]), m_List(new Weapon*[size]), m_DiscardIndex(0), index(0)
    {}
    ~WeaponList() { delete[] m_DiscardList; }
    
    void AddWeapon(Weapon* weapon);
    Weapon* GetWeaponByType(const int type);
    void RemoveWeapon(const int oid);
    void FindMatchWeapon(IronMan& ironMan);
    bool QueryOrder(const int oid);
};

void IronMan::DistributeWeapon(Weapon* weapon)
{
    // 给铁匠分配订单
    m_CurWeapon = weapon;
    m_IsBusy = true;
}

void IronMan::DoWork()
{
    // 如果有订单则工作
    if (m_CurWeapon != nullptr)
    {
        m_CurWeapon->DecreaseTime();
        
        // 如果完成即移除
        // 记得内存释放
        if (m_CurWeapon->isFinish())
        {
            m_FinishWeaponList[m_FinishIndex++] = m_CurWeapon->GetId();
            m_IsBusy = false;
            delete m_CurWeapon;
            m_CurWeapon = nullptr;
        }
    }
}

void IronMan::QueryFinishWeapon()
{
    for (int i = 0; i < m_FinishIndex; i++)
    {
        std::cout << m_FinishWeaponList[i] << " ";
    }
    
    std::cout << std::endl;
}

bool WeaponList::QueryOrder(const int oid)
{
    for (int i = 0; i < index; i++)
    {
        if (m_List[i]->GetId() == oid)
        {
            std::cout << "order " << oid << " pending" << std::endl;
            return true;
        }
    }
    
    for (int i = 0; i < m_DiscardIndex; i++)
    {
        if (m_DiscardList[i] == oid)
        {
            std::cout << "order " << oid << " discarded" << std::endl;
            return true;
        }
    }
    
    return false;
}

void WeaponList::AddWeapon(Weapon* weapon)
{
    // 往列表中添加新的兵器订单
    // 注意这里要按优先级排序
    // 优先级大的在前面
    
    // 首先判断是不是加满了
    if (index == m_Size)
    {
        // 移除列表中最后一个weapon
        // 加入被移除名单
        m_DiscardList[m_DiscardIndex++] = m_List[m_Size - 1]->GetId();
        delete m_List[m_Size - 1];
        index--;
    }
    
    // 记录新的兵器订单应该插入的位置
    // 如果为-1说明其优先级最高 插在最后一个
    int insertIndex = -1; 
    for (int i = 0; i < index; i++)
    {
        // 如果列表中的兵器订单优先级较小
        // 则说明这就是当前要插入的位置
        // 整体向后移
        if (weapon->ComparePriority(*m_List[i]))
        {
            insertIndex = i;
            break;
        }
    }
    
    // 若找到了应该插入的位置
    if (insertIndex != -1)
    {
        for (int i = index; i > insertIndex; i--)
        {
            m_List[i] = m_List[i-1];
        }
        m_List[insertIndex] = weapon;
    }
    else
    {
        m_List[index] = weapon;
    }
    
    index++;
}

Weapon* WeaponList::GetWeaponByType(const int type)
{
    // 根据类型获取优先级最高的兵器
    for (int i = 0; i < index; i++)
    {
        if (m_List[i]->GetType() == type)
        {
            return m_List[i];
        }
    }
    
    return nullptr;
}

void WeaponList::RemoveWeapon(const int oid)
{
    // 根据oid来移除对应的兵器订单
    int removeIndex = -1;
    for (int i = 0; i < index; i++)
    {
        if (m_List[i]->GetId() == oid)
        {
            removeIndex = i;
        }
    }
    
    if (removeIndex != -1)
    {
        for (int i = removeIndex; i < index; i++)
        {
            m_List[i] = m_List[i+1];
        }
        
        index--;
    }
}

void WeaponList::FindMatchWeapon(IronMan& ironMan)
{
    // 给铁匠分配合适订单
    // type相同且优先级最高
    if (ironMan.IsResting())
    {
        // 如果铁匠在休息 则分配订单
        for (int i = 0; i < index; i++)
        {
            if (m_List[i]->GetType() == ironMan.GetType())
            {
                // type相同
                ironMan.DistributeWeapon(m_List[i]);
                RemoveWeapon(m_List[i]->GetId());
                // 分配到了就可以返回了
                return;
            }
        }
    }
}

void IronManDoWork(IronMan** list, int size)
{
    // 做工作
    for (int i = 0; i < size; i++)
    {
        IronMan* ironMan = list[i];
        if (!ironMan->IsResting())
        {
            ironMan->DoWork();
        }
    }
}

void DistributeWork(IronMan** list, int size, WeaponList& weaponList)
{
    // 分配订单
    for (int i = 0; i < size; i++)
    {
        IronMan* ironMan = list[i];
        if (ironMan->IsResting())
        {
            weaponList.FindMatchWeapon(*ironMan);
        }
    }
}

IronMan* GetIronManById(IronMan** ironManList, int size, int uid)
{
    for (int i = 0; i < size; i++)
    {
        IronMan* ironMan = ironManList[i];
        if (ironMan->GetUId() == uid)
        {
            return ironMan;
        }
    }
    
    return nullptr;
}

void FindWeaponInIronMan(IronMan** list, int size, int oid)
{
    for (int i = 0; i < size; i++)
    {
        IronMan* ironMan = list[i];
        if (ironMan->GetCurWeaponId() == oid)
        {
            std::cout << "order " << oid << " doing" << std::endl;
            return;
        }
    }
    
    // 如果没有正在处理，那么说明一定已经被完成了
    std::cout << "order " << oid << " done" << std::endl;
}

int main()
{
    int num, limit;
    std::cin >> num >> limit;
    IronMan** ironManList = new IronMan*[num];
    WeaponList weaponList(limit);
    
    // 读取铁匠属性
    for (int i = 0; i < num; i++)
    {
        int uid, type;
        std::cin >> uid >> type;
        ironManList[i] = new IronMan(uid, type);
    }
    
    int n;
    std::cin >> n;
    std::string command;
    
    while (n > 0)
    {
        // 先进行调度
        // 首先先把所有铁匠所正在做的订单的时间减1
        IronManDoWork(ironManList, num);
        // 给每个铁匠找到对应的订单
        DistributeWork(ironManList, num, weaponList);
        
        // 读取新的命令
        std::cin >> command;
        if (command == "add")
        {
            int oid, priority, time, type;
            std::cin >> oid >> priority >> time >> type;
            Weapon* weapon = new Weapon(oid, priority, time, type);
            weaponList.AddWeapon(weapon);
        }
        else if (command == "queryUser")
        {
            int uid;
            std::cin >> uid;
            IronMan* ironMan = GetIronManById(ironManList, num, uid);
            if (ironMan != nullptr)
            {
                if (ironMan->IsResting())
                {
                    std::cout << "worker " << uid << " resting" << std::endl;
                }
                else
                {
                    std::cout << "worker " << uid << " doing order " << ironMan->GetCurWeaponId() << std::endl;
                }
            }
        }
        else if (command == "queryOrder")
        {
            int oid;
            std::cin >> oid;
            // 只需要查询是不是尚未开始处理或者被丢弃
            bool isInList = weaponList.QueryOrder(oid);
            if (!isInList)
            {
                FindWeaponInIronMan(ironManList, num, oid);
            }
        }
        else if (command == "queryOrders")
        {
            int uid;
            std::cin >> uid;
            IronMan* ironMan = GetIronManById(ironManList, num, uid);
            ironMan->QueryFinishWeapon();
        }
        
        n--;
    }
    
    // free memory
    for (int i = 0; i < num; i++)
    {
        delete ironManList[i];
    }
    delete[] ironManList;
    return 0;
}
