```
        <Popover open={aiOpen} onOpenChange={setAiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={aiOpen}
              className="bg-primary-foreground hover:bg-secondary h-8 w-full min-w-[50px] justify-between px-2 text-xs sm:min-w-[150px] md:w-[200px] md:min-w-[180px]"
            >
              <span className="mr-1 flex-1 truncate text-start">
                {localSelectedAI ? ais.find((ai) => ai.value === localSelectedAI)?.label : 'Gemini 2.5 Pro (Experimental)'}
              </span>
              <ChevronDown className="shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[100000] mr-2 w-[var(--radix-popover-trigger-width)] p-0 text-xs">
            <Command className="bg-primary-foreground">
              <CommandInput placeholder="Search ai..." />
              <CommandList className="overflow-hidden">
                <CommandEmpty>No ai found.</CommandEmpty>
                <CommandGroup className="px-0">
                  <ScrollArea className="h-max max-h-[300px] px-1.5">
                    {ais.map((ai) => (
                      <CommandItem
                        className="text-xs"
                        key={ai.value}
                        value={ai.value}
                        onSelect={(value) => {
                          setLocalSelectedAI(value);
                          aiService.setModel(value);
                          setAiOpen(false);

                          if (onAIChange) {
                            onAIChange(value);
                          }

                          toast({
                            title: "AI Model Changed",
                            description: `Switched to ${ais.find(model => model.value === value)?.label || value}`,
                            variant: "default",
                          });
                        }}
                      >
                        <span className="w-[20px] max-w-full flex-1 truncate">{ai.label}</span>
                        <Check
                          className={cn(
                            'ml-auto',
                            localSelectedAI === ai.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
```       
       
        ```<motion.button
          type="button"
          onClick={onSearchToggle}
          disabled={isLoading}
          className={cn(
            "text-muted-foreground hover:text-primary flex h-8 items-center justify-center gap-1.5 rounded-full border transition-all",
            showSearch ? "bg-background border px-2" : "border-transparent",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showSearch ? 180 : 0, scale: showSearch ? 1.1 : 1 }}
            whileHover={{ rotate: showSearch ? 180 : 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            <Globe
              className={cn(
                "hover:text-primary size-4",
                showSearch ? "text-primary" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showSearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Search
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        ```