CD=cd
NPM=npm install
MODULES_DIR=node_modules
DEPS=connect commander
EXISTING=$(subst $(MODULES_DIR)/,, $(wildcard $(MODULES_DIR)/*))
MISSING=$(filter-out $(EXISTING), $(DEPS))

all:
	@echo ""
	@echo "Node Linked Data Platform"
	@echo ""
	@echo "available targets:"
	@echo "  libs -- locally installs node dependencies via npm"

libs:
ifneq ($(MISSING),)
	$(NPM) $(MISSING)
endif
