# Final Project

## Due Last day of Class
## First report due Monday Oct 28, 2024


### Running the project
First you must create an .env file in your repository with the environmental variables MONGO_URI, CLIENT_ID, and CLIENT_SECRET. To get the MONGO_URI, accept my invitation to the MonogDB '264FinalProject' cluster. When signed in, select the Cluster, click 'Connect', then select 'Drivers' -> 'Node.js 6.7 or later'. There should be a connection string that looks something like:

mongodb+srv://tas325:<db_password>@264finalproject.jpwxa.mongodb.net/?retryWrites=true&w=majority&appName=264FinalProject

In this example tas325 is my username but you should change it to yours and replace <db_password> with whatever password you chose. Also make sure to go to the 'Network Access' tab and add your current IP address (MongoDB should have a button that automically does this if it sees your current IP address isn't in the database). 

For CLIENT_ID and CLIENT_SECRET go to the Google Cloud Console. Everyone should have been added to the '264FinalProject' project as an owner. Go to 'APIs and Services' -> 'Credentials' -> 'Web Client 1'. You can find the client id and secret on that page.

Once you add those three environmental variables you should be able to run the project. 

Make sure you are in the final-project-f24-kltrn folder. Run `npm install` and then `npm run dev`.

### Event and Invitation Endpoints

* `POST /events` - Creates a new event and sends invitations to the specified invitees.
* `PUT /events/:id` - Updates an existing event's details such as title, description, time, and location.
* `GET /events/organizer/:user_id` - Retrieves all events created by a specific organizer.
* `GET /events/invitee/:user_id` - Retrieves all events that a specific invitee has accepted invitations for.
* `GET /events/:id` - Retrieves details of a single event by its ID.
* `DELETE /events/:id` - Deletes an event by its ID along with all associated invitations.
* `PUT /invitations/:id` - Updates the status of an invitation (e.g., pending, accepted, declined).
* `GET /invitations/:user_id` - Retrieves all invitations received by a specific invitee, including associated event details.

### Build a web app in a team of 4-5

### Requirements:
* Must have user accounts and different user roles (like user/Admin, free/paid, etc)
* Must use a database (you choose)
* Must have interactive UI (of any kind)
* Must use a library or framework not discussed/used in class
* Must use an outside REST API in some way (Outside as in external, like the Reddit API, etc)

* Feel free to build off other projects and frameworks. For example [https://github.com/sahat/hackathon-starter] is a great starter project that you can build on top of. 

### Instructions
Build your team and write a document describing your application to me by Monday Oct 28, 2024. Email this document to me and the TA for this course (Xinhui Chen xic721@lehigh.edu)  I will approve your web application idea. In your paper, include:
* the name of your application
* Name and roles of all your team members
* its functionality (how does it meet each of the requirements listed above - list each requirement along with your will fulfill it)
* user story/use case (what happens when a user visits your application, what can they do, etc)
* technical design (what is your tech stack)


### Final deliverable due end of the semester:
* Codebase in Github Repo
* README describing your project, with all the information outlined above (team members, application name, description, etc). You will also include detailed instructions of how to install and run your application, and what API keys, databases, etc are needed to run your application.
* Final Presentation and Demo
  * You will prepare a 5 minute presentation and demo of your application in class during the last week of classes
