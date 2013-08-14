using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebChat.Repositories;
using WebChat.Repositories.SerializableModels;

namespace WebChat.Api.Controllers
{
    public class ChatsController : ApiController
    {
        private IRepositoryChats<ChatModel> chatRepository;

        public ChatsController(IRepositoryChats<ChatModel> chatsRepository)
        {
            this.chatRepository = chatsRepository;
        }

        [HttpGet]
        public IEnumerable<ChatModel> Get([FromUri] int[] ids)
        {
            if (ids.Length==0)
            {
                return this.chatRepository.All().ToList();
            }
            else if (ids.Length == 2)
            {
                List<ChatModel> list = new List<ChatModel>();
                list.Add(this.chatRepository.Get(ids[0], ids[1]));
                return list;
            }
            else
            {
                throw new ArgumentException("Invalid arguments provided");
            }
            
        }


        // POST api/chats
        public ChatModel Post([FromBody]ChatModel value)
        {
            //TODO: get channel from pubnub
            return this.chatRepository.Add(value);
        }


        // DELETE api/chats/5
        [HttpDelete]
        public HttpResponseMessage Delete([FromUri] int[] ids)
        {
            this.chatRepository.Delete(ids[0], ids[1]);

            var response = Request.CreateResponse(HttpStatusCode.OK);

            return response;
        }
    }
}
