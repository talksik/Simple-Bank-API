# Simple-Bank-API
Please read below for design explanation:

Local Database Configuration: 
- schema : bank
  - tables are outlined in PDF I sent to Thomas
   - The users table is basically the mapper which has 3 sub tables:
      - should have last_updated_by, but no real interface with auth currently
	- info : for customer details like address. This would obviously be extended to more columns in reality, whatever banks ask for these days...
	- account : This also maps to the user which has the main bank information like balance. Key thing to note is that a user may have multiple accounts so thats why this is separated.
	- permissions: This is to allow functionality of the bonus of setting limits to withdrawals and deposits. Would add another POST for adding a second account.


POST:
 - A user requires certain parameters to get valid entries in database. An error is sent for invalid input. Can also check if, for instance, a given email is an actual email, either in frontend or here.
 - Transaction sort of setup with inserting into users and info

GET:
 - Currently return all particular accounts for given user. Spec says to return one account, but may be the case that a user has many, and so result is an array of accounts for that user.

DEPOSIT/WITHDRAW:
 - Dynamic mehthod for both actions. 
 - Commented areas to perhaps use the helper functions to do the verifications for bonus number 3. 

BONUS: The nice DB structure allows accessing permissions and modulating the helpers for checking account balance and also checking if a certain deposit/withdraw is within the user's limits.
Should call these functions in practically every relevant HTTP request made. 

**Note: The permissions table in the diagram I sent by email does not and should include the columns for lower and upper limits for the account, but my local database does. 
