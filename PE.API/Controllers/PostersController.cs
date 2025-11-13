using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PE.API.Data;
using PE.API.Models;

namespace PE.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PostersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Posters?search=keyword&sortBy=name&sortOrder=asc
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Poster>>> GetPosters(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = "asc")
        {
            var query = _context.Posters.AsQueryable();

            // Search by name
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            // Sort by name
            if (sortBy?.ToLower() == "name")
            {
                query = sortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name);
            }
            else
            {
                // Default sort by Id descending (newest first)
                query = query.OrderByDescending(p => p.Id);
            }

            return await query.ToListAsync();
        }

        // GET: api/Posters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Poster>> GetPoster(int id)
        {
            var poster = await _context.Posters.FindAsync(id);

            if (poster == null)
            {
                return NotFound();
            }

            return poster;
        }

        // POST: api/Posters
        [HttpPost]
        public async Task<ActionResult<Poster>> CreatePoster(Poster poster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Posters.Add(poster);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPoster), new { id = poster.Id }, poster);
        }

        // PUT: api/Posters/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePoster(int id, Poster poster)
        {
            if (id != poster.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(poster).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PosterExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Posters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePoster(int id)
        {
            var poster = await _context.Posters.FindAsync(id);
            if (poster == null)
            {
                return NotFound();
            }

            _context.Posters.Remove(poster);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PosterExists(int id)
        {
            return _context.Posters.Any(e => e.Id == id);
        }
    }
}
