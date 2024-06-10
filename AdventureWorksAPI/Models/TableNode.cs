using System.Drawing;

namespace AdventureWorksAPI.Models
{
    public class TableNode
    {
        public string Key { get; set; }
        public Point Location { get; set; }
        public List<ColumnInfo> Items { get; set; }
        public List<ColumnInfo> InheritedItems { get; set; }
    }
}
