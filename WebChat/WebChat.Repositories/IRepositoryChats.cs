using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace WebChat.Repositories
{
    public interface IRepositoryChats<T>
    {
        T Add(T entity);
        void Delete(int id1, int id2);
        T Get(int id1, int id2);
        IQueryable<T> All();
        IQueryable<T> Find(Expression<Func<T, bool>> predicate);
    }
}
