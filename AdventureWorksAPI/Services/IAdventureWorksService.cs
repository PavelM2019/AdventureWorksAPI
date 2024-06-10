using AdventureWorksAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AdventureWorksAPI.Services
{
    public interface IAdventureWorksService
    {
        Task<IEnumerable<TableNode>> GetTablesAsync();
        Task<IEnumerable<LinkInfo>> GetLinksAsync();
    }
}