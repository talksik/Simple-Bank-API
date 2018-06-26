# Simple-Bank-API
Please read below for design explanation:

Local Database Configuration: 
- schema : bank
  - tables are outlined in PDF I sent to Thomas
   - The users table is basically the mapper which has 3 sub tables:
	- info : for customer details like address. This would obviously be extended to more columns in reality.
	- account : This also maps to the user which has the main bank information like balance. Key thing to note is that a user may have multiple accounts so thats why this is separated.
	- permissions: This is to allow functionality of the bonus of setting limits to withdrawals and deposits. 



