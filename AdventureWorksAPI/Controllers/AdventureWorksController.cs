using AdventureWorksAPI.Models;
using AdventureWorksAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace AdventureWorksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdventureWorksController : ControllerBase
    {
        private readonly IAdventureWorksService _service;

        public AdventureWorksController(IAdventureWorksService service)
        {
            _service = service;
        }

        [HttpGet("tables")]
        public async Task<IActionResult> GetTables()
        {
            var tables = await _service.GetTablesAsync();
            var LinkInfo = await _service.GetLinksAsync();

            return Ok(new { tables, LinkInfo });
        }
    }
}