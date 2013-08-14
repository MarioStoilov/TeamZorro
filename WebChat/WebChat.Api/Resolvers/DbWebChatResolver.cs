using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Http.Dependencies;
using WebChat.Api.Controllers;
using WebChat.Model;
using WebChat.Repositories;
using WebChat.Repositories.SerializableModels;

namespace WebChat.Api.Resolvers
{
    public class DbWebChatResolver : IDependencyResolver
    {
        private static DbContext webChatContext = new WebChatEntities();

        private static IRepositoryUsers<UserModel> repositoryUsers = new DbUsersRepository(webChatContext);

        private static IRepositoryChats<ChatModel> repositoryChats = new DbChatsRepository(webChatContext);


        public IDependencyScope BeginScope()
        {
            return this;
        }

        public object GetService(Type serviceType)
        {
            if (serviceType == typeof(UsersController))
            {
                return new UsersController(repositoryUsers);
            }
            else if (serviceType == typeof(ChatsController))
            {
                return new ChatsController(repositoryChats);
            }
            else
            {
                return null;
            }
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return new List<object>();
        }

        public void Dispose()
        {
        }
    }
}