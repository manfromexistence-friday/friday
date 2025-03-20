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

curl -X POST https://friday-backend.vercel.app/api/gemini-2.0-flash \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "question": "Hello, how are you?",
    "model": "gemini-2.0-flash",
    "sessionId": "27007a23-2a9a-4bfc-9907-a9e668cf0f4a"
  }' | json_pp

   {/* <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Listen</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regenerate</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onLike}
              className={cn(
                "rounded-full p-1.5 hover:bg-muted transition-colors flex items-center gap-1",
                reactions?.likes && "text-primary"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {reactions?.likes && reactions.likes > 0 && (
                <span className="text-xs tabular-nums">{reactions.likes}</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Like</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDislike}
              className={cn(
                "rounded-full p-1.5 hover:bg-muted transition-colors flex items-center gap-1",
                reactions?.dislikes && "text-destructive"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {reactions?.dislikes && reactions.dislikes > 0 && (
                <span className="text-xs tabular-nums">{reactions.dislikes}</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dislike</p>
          </TooltipContent>
        </Tooltip>
        <SidebarProvider>
          <MoreActions />
        </SidebarProvider>
      </TooltipProvider> */}



         {/* <TooltipProvider>
        <Tooltip>

          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Listen</p>
          </TooltipContent>
        </Tooltip>
        <SidebarProvider>
          <MoreActions />
        </SidebarProvider>
      </TooltipProvider> */}