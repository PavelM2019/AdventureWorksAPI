# AdventureWorksAPI
  This project implements a graphical display of connections between tables, with the possibility of exporting diagrams in PDF format. It is based on the GOJS library https://gojs.net/. The backend is implemented on ASP.NET CORE Web API.
  - Primary keys are depicted as purple triangles. 
  - Foreign  keys as blue rhombus.
## Requirements
- Visual Studio
- MS SQL Server
- AdventureWorks sample databases (or any other)
## Installation procedure
- Install AdventureWorks sample database on your computer. Rename it to "AdventureWorks". Installation instructions ![here](https://learn.microsoft.com/en-us/sql/samples/adventureworks-install-configure?view=sql-server-ver16&tabs=ssms)
- Pull and build the repository on your computer.
- If you installed the AdventureWorks database and named it “AdventureWorks” you don’t need to change anything. If you are using another database, please write the path to it in the **appsettings.json** file, which is located in the root folder of your project
- Launch the project in Visual Studio. This will start the web server. Like this https://localhost:7017/swagger/index.html
- After put the Client API address in your browser (**yourlocalhostaddress + /index.html**)  Example: https://localhost:7017/index.html
## The result should be something like this:
![image](https://github.com/PavelM2019/AdventureWorksAPI/assets/55024344/bf29059d-df66-42e6-8450-de3e7e0168ce)








