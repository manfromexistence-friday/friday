Linear Search
What is a Linear Search ? 	

Linear search is a simple searching algorithm used to find the position of a target element in a list or array. It works by checking each element sequentially, starting from the first, until the target element is found or the list ends.

Key Points:
Approach: Compare the target element with each element in the list.
Best Case: The target is at the first position (O(1)).
Worst Case: The target is at the last position or not present (O(n)).
Time Complexity: O(n), where n is the number of elements in the list.


Steps and Code:
Start at the beginning:
Look at the first number in the list.
Check if it matches the number you are searching for.
Compare the number:
If it matches, you’ve found it! Remember the position (index).
If it doesn’t match, move to the next number in the list.
Keep checking until you ﬁnd it (or reach the end):
Repeat the process for each number.
If you find a match, you stop searching immediately.
If you check all the numbers and still haven’t found it, that means it’s not in the list.
Return the result:
If the number is found, return its index.
If the number is not found, return -1 (or print “Not Found”).
