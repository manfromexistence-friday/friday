            <div
              key={index}
              className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {message.role === "user" ? null : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "relative max-w-[80%] rounded-lg p-3 hover:bg-primary-foreground hover:text-primary",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}

                <div className="text-sm  h-">
                  {message.content}
                </div>
                <MessageActions
                  content={message.content}
                  onLike={() => chatService.updateMessageReaction(chatId!, index, 'like')}
                  onDislike={() => chatService.updateMessageReaction(chatId!, index, 'dislike')}
                  reactions={message.reactions}
                />
                <HoverCard>
                  <HoverCardTrigger>
                    {message.content}
                  </HoverCardTrigger>
                  <HoverCardContent>
                    {message.role === "assistant" && (
                      <MessageActions
                        content={message.content}
                        onLike={() => chatService.updateMessageReaction(chatId!, index, 'like')}
                        onDislike={() => chatService.updateMessageReaction(chatId!, index, 'dislike')}
                        reactions={message.reactions}
                      />
                    )}
                  </HoverCardContent>
                </HoverCard>
              </div>
              {message.role === "user" ? (
                <Avatar>
                  <AvatarImage src={"/user.png"} />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              ) : null}
            </div>