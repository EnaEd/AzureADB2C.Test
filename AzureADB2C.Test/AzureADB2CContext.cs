using AzureADB2C.Test.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AzureADB2C.Test
{
    public class AzureADB2CContext : IdentityDbContext<AzureUser, IdentityRole<int>, int>
    {
        public DbSet<AzureUser> AzureUsers { get; set; }

        public AzureADB2CContext(DbContextOptions<AzureADB2CContext> option) : base(option)
        {
            var admin = new AzureUser()
            {
                Email = "Admin@Admin.com",
                NormalizedEmail = "ADMIN@ADMIN.COM",
                UserName = "Admin@Admin.com",
                NormalizedUserName = "ADMIN@ADMIN.COM",
                PhoneNumber = "+111111111111",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D"),
            };

            CreateUser(admin, this, true).GetAwaiter().GetResult();
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

           

            
        }

        private static async Task CreateUser(AzureUser user, AzureADB2CContext context, bool isAdmin = false)
        {
            if (!context.Users.Any(u => u.UserName == user.UserName))
            {
                var password = new PasswordHasher<AzureUser>();
                var hashed = password.HashPassword(user, isAdmin ? "Admin123!" : "Qwerty123!");
                user.PasswordHash = hashed;

                var userStore = new UserStore<AzureUser, IdentityRole<int>, AzureADB2CContext, int>(context);
                //// There is no class or interface called AzureUser<int>.
                await userStore.CreateAsync(user);
            }
        }
    }
}