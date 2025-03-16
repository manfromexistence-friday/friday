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

            In this /chat/layout.tsx file make a or a import a component called siteheader which will only show up in the smaller screens and also make a bottombar only in smaller screens means less then lg breakpoint. The siteheader will be like ```a hamburger button in the most left site will use shadcn component like in the listed mobile nav file it will pop sheet at left side and the contents of the sheet will be like the components that present in the left-sidebar then there will be v0 logo from team-swithcer at its right. And in the right side of the siteheader there it will be like right-sidebar a three button will show some sidebar dropdows and there will be two sidebars in the most right side as implemented in the right-sidebar. And the site-bottombar will be five icons representing those five links in the left-sidebar file and just the icons at the bottom only on the the screens