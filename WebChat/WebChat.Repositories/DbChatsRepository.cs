using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebChat.Model;
using WebChat.Repositories.SerializableModels;

namespace WebChat.Repositories
{
    public class DbChatsRepository : IRepositoryChats<ChatModel>
    {
        private DbContext dbContext;
        private DbSet<User> userSet;
        private DbSet<Chat> chatSet;

        public DbChatsRepository(DbContext dbContext)
        {
            if (dbContext == null)
            {
                throw new ArgumentException("An instance of DbContext is required to use this repository.", "context");
            }

            this.dbContext = dbContext;
            this.userSet = this.dbContext.Set<User>();
            this.chatSet = this.dbContext.Set<Chat>();
        }



        public ChatModel Add(ChatModel entity)
        {
            User firstUser = (from user in this.userSet
                              where user.Name.ToLower() == entity.User1.Name.ToLower()
                              select user).FirstOrDefault();

            if (firstUser==null)
            {
                throw new ArgumentException("First user does not exist");
            }

            User secondUser = (from user in this.userSet
                              where user.Name.ToLower() == entity.User2.Name.ToLower()
                              select user).FirstOrDefault();

            if (secondUser == null)
            {
                throw new ArgumentException("Second user does not exist");
            }


            Chat newChat = new Chat() { Channel=entity.Channel};//, User1=firstUser, User2=secondUser };
            if (firstUser.Id<secondUser.Id)
            {
                newChat.User1 = firstUser;
                newChat.User2 = secondUser;
            }
            else if (firstUser.Id>secondUser.Id)
            {
                newChat.User2 = firstUser;
                newChat.User1 = secondUser;
            }
            else
            {
                throw new ArgumentException("Cannot chat with yourself");
            }

            if (this.chatSet.Any(c => c.User1.Id==firstUser.Id && c.User2.Id==secondUser.Id))
            {
                throw new ArgumentException("Chat already exists");
            }

            this.chatSet.Add(newChat);
            this.dbContext.SaveChanges();

            return new ChatModel() { Channel = newChat.Channel, 
                User1 = new UserModel() { Id = firstUser.Id, Name = firstUser.Name }, 
                User2 = new UserModel() { Id = secondUser.Id, Name = secondUser.Name } 
            };
        }


        public void Delete(int id1, int id2)
        {
            Chat chatToDelete = (from chat in this.chatSet.Include("User1").Include("User2")
                                 where (chat.User1.Id == id1 && chat.User2.Id == id2)
                                         || (chat.User1.Id == id2 && chat.User2.Id == id1)
                                 select chat).FirstOrDefault();

            if (chatToDelete==null)
            {
                throw new ArgumentException("Chat does not exist");
            }

            this.chatSet.Remove(chatToDelete);
            this.dbContext.SaveChanges();
        }

        public ChatModel Get(int id1, int id2)
        {
            Chat result = (from chat in this.chatSet.Include("User1").Include("User2")
                                 where (chat.User1.Id == id1 && chat.User2.Id == id2)
                                         || (chat.User1.Id == id2 && chat.User2.Id == id1)
                                 select chat).FirstOrDefault();

            return new ChatModel()
            {
                User1 = new UserModel() { Id = result.User1.Id, Name = result.User1.Name },
                User2 = new UserModel() { Id = result.User2.Id, Name = result.User2.Name },
                Channel = result.Channel
            };
        }

        public IQueryable<ChatModel> All()
        {
            var result = from chat in this.chatSet.Include("User1").Include("User2")
                         select new ChatModel()
                         {
                             User1 = new UserModel() { Id = chat.User1.Id, Name = chat.User1.Name },
                             User2 = new UserModel() { Id = chat.User2.Id, Name = chat.User2.Name },
                             Channel= chat.Channel
                         };

            return result;
        }

        public IQueryable<ChatModel> Find(System.Linq.Expressions.Expression<Func<ChatModel, bool>> predicate)
        {
            return this.All().Where(predicate);
        }
    }
}
