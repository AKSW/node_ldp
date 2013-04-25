CD=cd
NPM=npm install
NODEUNIT=`npm bin -g`/nodeunit
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
	@echo "  libs -- locally installs runtime node dependencies via npm"
	@echo "  test -- run unit test (requires nodeunit to be installed)"

libs:
ifneq ($(MISSING),)
	$(NPM) $(MISSING)
endif

.PHONY: test
test:
	@$(NODEUNIT) $(TESTS)
