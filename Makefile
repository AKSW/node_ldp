CD=cd
NPM=npm install
MODULES_DIR=node_modules
TEST_DIR=test
DEPS=connect commander
EXISTING=$(subst $(MODULES_DIR)/,, $(wildcard $(MODULES_DIR)/*))
MISSING=$(filter-out $(EXISTING), $(DEPS))
TESTS=$(wildcard $(TEST_DIR)/test-*.js)

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

.PHONY: test
test:
	nodeunit $(TESTS)
