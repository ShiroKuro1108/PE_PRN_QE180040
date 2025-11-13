using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PE.API.Data;
using PE.API.Models;

namespace PE.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MoviesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Movies?search=title&genre=Action&sortBy=rating&sortOrder=desc
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies(
            [FromQuery] string? search = null,
            [FromQuery] string? genre = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = "asc")
        {
            var query = _context.Movies.AsQueryable();

            // Search by title
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m => m.Title.Contains(search));
            }

            // Filter by genre
            if (!string.IsNullOrWhiteSpace(genre))
            {
                query = query.Where(m => m.Genre != null && m.Genre.ToLower() == genre.ToLower());
            }

            // Sort
            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "rating":
                        query = sortOrder?.ToLower() == "desc"
                            ? query.OrderByDescending(m => m.Rating ?? 0).ThenBy(m => m.Title)
                            : query.OrderBy(m => m.Rating ?? 0).ThenBy(m => m.Title);
                        break;
                    case "title":
                        query = sortOrder?.ToLower() == "desc"
                            ? query.OrderByDescending(m => m.Title)
                            : query.OrderBy(m => m.Title);
                        break;
                    default:
                        query = query.OrderByDescending(m => m.Id);
                        break;
                }
            }
            else
            {
                // Default sort by Id descending (newest first)
                query = query.OrderByDescending(m => m.Id);
            }

            return await query.ToListAsync();
        }

        // GET: api/Movies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
            {
                return NotFound();
            }

            return movie;
        }

        // GET: api/Movies/genres
        [HttpGet("genres")]
        public async Task<ActionResult<IEnumerable<string>>> GetGenres()
        {
            var genres = await _context.Movies
                .Where(m => m.Genre != null && m.Genre != "")
                .Select(m => m.Genre!)
                .Distinct()
                .OrderBy(g => g)
                .ToListAsync();

            return genres;
        }

        // POST: api/Movies
        [HttpPost]
        public async Task<ActionResult<Movie>> CreateMovie(Movie movie)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, movie);
        }

        // PUT: api/Movies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, Movie movie)
        {
            if (id != movie.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(movie).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieExists(id))
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

        // DELETE: api/Movies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound();
            }

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MovieExists(int id)
        {
            return _context.Movies.Any(e => e.Id == id);
        }
    }
}
