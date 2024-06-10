using System.Data.SqlClient;
using AdventureWorksAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Data;

namespace AdventureWorksAPI.Services
{
    public class AdventureWorksService : IAdventureWorksService
    {
        private readonly IConfiguration _configuration;

        public AdventureWorksService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<IEnumerable<TableNode>> GetTablesAsync()
        {
            var foreignKeys = new List<ForeignKeyInfo>();
            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.OpenAsync();
                var query = @"
                    SELECT
                        fk.name AS FK_Name,
                        tp.name AS ParentTable,
                        cp.name AS ParentColumn,
                        tr.name AS ReferencedTable,
                        cr.name AS ReferencedColumn
                    FROM
                        sys.foreign_keys AS fk
                    INNER JOIN
                        sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
                    INNER JOIN
                        sys.tables AS tp ON fkc.parent_object_id = tp.object_id
                    INNER JOIN
                        sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
                    INNER JOIN
                        sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
                    INNER JOIN
                        sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id";
                using (var command = new SqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        foreignKeys.Add(new ForeignKeyInfo
                        {
                            ForeignKeyName = reader.GetString(0),
                            ParentTable = reader.GetString(1),
                            ParentColumn = reader.GetString(2),
                            ReferencedTable = reader.GetString(3),
                            ReferencedColumn = reader.GetString(4)
                        });
                    }
                }
            }

            var relatedTableNames = foreignKeys
                .SelectMany(fk => new[] { fk.ParentTable, fk.ReferencedTable })
                .Distinct()
                .ToList();

            var tableNodes = new List<TableNode>();
            double x = 0, y = 0;
            foreach (var table in relatedTableNames)
            {
                var KeyItems = foreignKeys
                    .Where(fk => fk.ReferencedTable == table)
                    .GroupBy(fk => fk.ReferencedColumn)
                    .Select(g => g.First())
                    .Select(fk => new ColumnInfo
                    {
                        Name = fk.ReferencedColumn,
                        IsKey = false,
                        Figure = "TriangleUp",
                        Color = "purple"
                    }).ToList();

                var inheritedItems = foreignKeys
                .Where(fk => fk.ParentTable == table)
                .GroupBy(fk => fk.ParentColumn)
                .Select(g => g.First())
                .Select(fk => new ColumnInfo
                {
                    Name = fk.ParentColumn,
                    IsKey = true,
                    Figure = "Decision",
                    Color = "blue"
                }).ToList();

                tableNodes.Add(new TableNode
                {
                    Key = table,
                    Location = new Point { X = x, Y = y },
                    Items = KeyItems,
                    InheritedItems = inheritedItems
                }); ;

                x += 250;
                if (x > 1000)
                {
                    x = 0;
                    y += 200;
                }
            }

            return tableNodes;
        }
        public async Task<IEnumerable<LinkInfo>> GetLinksAsync()
        {
            var links = new List<LinkInfo>();
            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.OpenAsync();
                var query = @"
                    SELECT
                        tp.name AS FromTable,
                        tr.name AS ToTable
                    FROM
                        sys.foreign_keys AS fk
                    INNER JOIN
                        sys.tables AS tp ON fk.parent_object_id = tp.object_id
                    INNER JOIN
                        sys.tables AS tr ON fk.referenced_object_id = tr.object_id";
                using (var command = new SqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        links.Add(new LinkInfo
                        {
                            from = reader.GetString(0),
                            to = reader.GetString(1),
                            text = "0..N",
                            toText = "1"
                        });
                    }
                }
            }
            return links;
        }
    }
}
