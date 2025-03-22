from tree_sitter import Language, Parser
import tree_sitter_cpp as cpython
import sympy as sp
from typing import Callable, List, Union, Dict, Any, Tuple

class CodeParser:
    __slots__ = ['language', 'parser', 'n', 'errors', 'memory_units', 'function_definitions', 'recursive_functions']

    def __init__(self):
        self.language = Language(cpython.language())
        self.parser = Parser(self.language)
        self.n = sp.symbols('n')
        self.errors = []
        self.memory_units = []
        self.function_definitions = {}  
        self.recursive_functions = set()  

    def process_code_for_parsing(self, code: str) -> str:
        code = code.replace(";", ";\n")  
        code = code.replace("{", "{\n")  
        code = code.replace("}", "\n}")
    
        lines = code.split('\n')
        processed_lines = []
        
        for line in lines:
            trimmed = line.strip()
            if trimmed:  
                processed_lines.append(trimmed)
            else:  
                processed_lines.append('')
        return '\n'.join(processed_lines) 

    def evaluate_code_syntax(self, code: str):
        tree = self.parser.parse(bytes(code, 'utf8'))
        return tree
    
    def print_tree(self, tree):
        def print_node(node, depth=0):
            print('  ' * depth + f'- {node.type}', end='')
            if len(node.children) == 0:
                text = node.text.decode('utf8')
                print(f': "{text}"')
            else:
                print()
            for child in node.children:
                print_node(child, depth + 1)
    
        print("\nDetailed tree structure:")
        print_node(tree.root_node)

    def traverse(self, node, node_handlers: List[Callable], context: dict = None):
        if context is None:
            context = {}
            
        for handler in node_handlers:
            handler(node, context)
            
        for child in node.children:
            self.traverse(child, node_handlers, context)
            
        return context

    def find_error_nodes(self, node):
        self.errors = []
        
        def error_handler(node, context):
            if node.type == "ERROR":
                context.setdefault('errors', []).append(node)
                
        context = self.traverse(node, [error_handler], {'errors': []})
        return context.get('errors', [])
    
    def analyze_time_complexity(self, node) -> sp.Expr:
        self.identify_functions_and_recursion(node)
        
        def loop_handler(node, context: Dict[str, Any]):
            if node.type in ('for_statement', 'while_statement', 'do_statement'):
                context['current_depth'] += 1
                context['max_loop_depth'] = max(context['max_loop_depth'], context['current_depth'])
                
                loop_range = _detect_loop_range(node)
                if loop_range is not None:
                    context['loop_ranges'].append(loop_range)
                
                if _detect_log_pattern(node):
                    context['log_factors'] += 1
                
                if _detect_factorial_pattern(node) and context['current_depth'] > 1:
                    context['factorial_detected'] = True
        
        def recursive_call_handler(node, context):
            if node.type == 'call_expression':
                function_node = node.child_by_field_name('function')
                if function_node:
                    function_name = function_node.text.decode('utf8')
                    if function_name in self.recursive_functions:
                        context['recursive_calls'].append(function_name)
                        
                        if _detect_linear_recursion(node, function_name):
                            context['linear_recursion'] = True
                        elif _detect_binary_recursion(node, function_name):
                            context['binary_recursion'] = True
                        elif _detect_exponential_recursion(node, function_name):
                            context['exponential_recursion'] = True
                            
        def _detect_linear_recursion(node, function_name):
            parent = node.parent
            if parent and parent.type == 'expression_statement':
                prev_sibling = parent.prev_sibling
                if prev_sibling and prev_sibling.type == 'if_statement':
                    return True
            return False
            
        def _detect_binary_recursion(node, function_name):
            parent = node.parent
            if parent:
                siblings = [c for c in parent.parent.children if c.type == 'call_expression']
                call_count = sum(1 for s in siblings if s.child_by_field_name('function') and 
                                s.child_by_field_name('function').text.decode('utf8') == function_name)
                return call_count >= 2
            return False
            
        def _detect_exponential_recursion(node, function_name):
            parent = node.parent
            if parent:
                siblings = [c for c in parent.parent.children if c.type == 'call_expression']
                call_count = sum(1 for s in siblings if s.child_by_field_name('function') and 
                                s.child_by_field_name('function').text.decode('utf8') == function_name)
                return call_count > 2
            return False
                            
        def loop_exit_handler(node, context):
            if node.type in ('for_statement', 'while_statement', 'do_statement'):
                context['current_depth'] -= 1
        
        def _detect_loop_range(loop_node) -> Union[sp.Expr, None]:
            if loop_node.type == 'for_statement':
                init_expr = next((c for c in loop_node.children if c.type == 'declaration'), None)
                cond_expr = next((c for c in loop_node.children if c.type == 'binary_expression'), None)
                
                if init_expr and cond_expr:
                    init_text = init_expr.text.decode('utf8')
                    cond_text = cond_expr.text.decode('utf8')
                    
                    if '=0' in init_text and '<' in cond_text:
                        bound_var = cond_text.split('<')[1].strip()
                        try:
                            bound = int(bound_var)
                            return sp.Integer(bound)
                        except ValueError:
                            return sp.symbols(bound_var)
            
            return None
        
        def _detect_log_pattern(loop_node) -> bool:
            if loop_node.type == 'for_statement' and len(loop_node.children) >= 7:
                update_expr = loop_node.children[6] 
                text = update_expr.text.decode('utf8')
                return any(op in text for op in ('*=', '/=', '*2', '/2', '>>'))
            
            if loop_node.type == 'while_statement':
                condition = next((c for c in loop_node.children if c.type == 'parenthesized_expression'), None)
                if condition:
                    cond_text = condition.text.decode('utf8')
                    return any(op in cond_text for op in ('>', '<', '>=', '<=', '/=', '*='))
            return False

        def _detect_factorial_pattern(loop_node) -> bool:
            if loop_node.type == 'for_statement':
                init = next((c for c in loop_node.children if c.type == 'declaration'), None)
                cond = next((c for c in loop_node.children if c.type == 'binary_expression'), None)
                update = next((c for c in loop_node.children if c.type == 'update_expression'), None)
                
                if init and cond and update:
                    init_text = init.text.decode('utf8')
                    cond_text = cond.text.decode('utf8')
                    update_text = update.text.decode('utf8')
                    
                    if ('=n' in init_text or '>0' in cond_text) and '--' in update_text:
                        return True
            return False
        
        complexity_context = {
            'max_loop_depth': 0,
            'current_depth': 0,
            'log_factors': 0,
            'factorial_detected': False,
            'loop_ranges': [],
            'recursive_calls': [],
            'linear_recursion': False,
            'binary_recursion': False,
            'exponential_recursion': False
        }
        
        self.traverse(node, [loop_handler, recursive_call_handler], complexity_context)
        self.traverse(node, [loop_exit_handler], complexity_context)
        
        if complexity_context['factorial_detected']:
            base_complexity = sp.factorial(self.n)
        elif complexity_context['max_loop_depth'] > 0:
            if complexity_context['loop_ranges']:
                base_complexity = sp.Integer(1)
                for loop_range in complexity_context['loop_ranges']:
                    base_complexity *= loop_range
            else:
                base_complexity = self.n ** complexity_context['max_loop_depth']
        else:
            base_complexity = sp.Integer(1)
            
        if complexity_context['log_factors'] > 0:
            base_complexity *= sp.log(self.n) ** complexity_context['log_factors']
            
        if complexity_context['recursive_calls']:
            if complexity_context['linear_recursion']:
                recursive_complexity = self.n
            elif complexity_context['binary_recursion']:
                recursive_complexity = self.n * sp.log(self.n)
            elif complexity_context['exponential_recursion']:
                recursive_complexity = 2 ** self.n
            else:
                recursive_complexity = self.n
                
            return self._complexity_compare(base_complexity, recursive_complexity)
            
        return base_complexity
    
    def identify_functions_and_recursion(self, root_node):
        self.function_definitions = {}
        self.recursive_functions = set()
        
        def function_def_handler(node, context):
            if node.type == 'function_definition':
                declarator = node.child_by_field_name('declarator')
                if declarator:
                    name_node = next((c for c in declarator.children if c.type == 'identifier'), None)
                    if name_node:
                        function_name = name_node.text.decode('utf8')
                        self.function_definitions[function_name] = node
                        context['functions'].append(function_name)
        
        def recursive_call_checker(node, context):
            if 'current_function' not in context or not context['current_function']:
                return
                
            if node.type == 'call_expression':
                function_node = node.child_by_field_name('function')
                if function_node:
                    called_function = function_node.text.decode('utf8')
                    if called_function == context['current_function']:
                        self.recursive_functions.add(called_function)
                        context['recursive_functions'].add(called_function)
        
        functions_context = {'functions': []}
        self.traverse(root_node, [function_def_handler], functions_context)
        
        recursion_context = {
            'current_function': None,
            'recursive_functions': set()
        }
        
        for function_name, function_node in self.function_definitions.items():
            recursion_context['current_function'] = function_name
            self.traverse(function_node, [recursive_call_checker], recursion_context)
            recursion_context['current_function'] = None
    
    def analyze_memory_usage(self, node) -> Tuple[sp.Expr, Dict[str, Any]]:
        self.identify_functions_and_recursion(node)
        
        recursive_stack_info = {
            func_name: {'max_depth': 1, 'frame_size': 0} 
            for func_name in self.recursive_functions
        }
        
        def memory_handler(node, context):
            """Handler to detect memory allocations in the code"""
            if node.type == 'declaration':
                type_node = node.child_by_field_name('type')
                type_name = type_node.text.decode('utf8') if type_node else 'unknown'
                
                type_size = _estimate_type_size(type_name)
                
                declarators = node.children_by_field_name('declarator')
                for d in declarators:
                    if d.type == 'array_declarator':
                        size_node = d.child_by_field_name('size')
                        if size_node:
                            size_text = size_node.text.decode('utf8')
                            try:
                                size_value = int(size_text)
                                memory_expr = sp.Integer(size_value) * sp.Integer(type_size)
                            except ValueError:
                                if size_text == 'n':
                                    memory_expr = self.n * sp.Integer(type_size)
                                else:
                                    size_symbol = sp.symbols(size_text)
                                    memory_expr = size_symbol * sp.Integer(type_size)
                            
                            context['memory_exprs'].append(memory_expr)
                    
                    elif d.type == 'init_declarator':
                        value_node = d.child_by_field_name('value')
                        if value_node and value_node.type == 'call_expression':
                            args_node = value_node.child_by_field_name('arguments')
                            if args_node and len(args_node.children) > 1:
                                size_arg = args_node.children[1].text.decode('utf8')
                                try:
                                    size_value = int(size_arg)
                                    memory_expr = sp.Integer(size_value) * sp.Integer(type_size)
                                except ValueError:
                                    if size_arg == 'n':
                                        memory_expr = self.n * sp.Integer(type_size)
                                    else:
                                        size_symbol = sp.symbols(size_arg)
                                        memory_expr = size_symbol * sp.Integer(type_size)
                                
                                context['memory_exprs'].append(memory_expr)
                        
                        else:
                            if 'current_function' in context and context['current_function']:
                                if context['current_function'] in recursive_stack_info:
                                    recursive_stack_info[context['current_function']]['frame_size'] += type_size
                            
                            context['memory_exprs'].append(sp.Integer(type_size))
            
            if node.type == 'call_expression':
                function_node = node.child_by_field_name('function')
                if function_node:
                    function_name = function_node.text.decode('utf8')
                    if function_name in self.recursive_functions:
                        if 'current_function' in context and context['current_function'] == function_name:
                            context['current_recursive_depth'] += 1
                            recursive_stack_info[function_name]['max_depth'] = max(
                                recursive_stack_info[function_name]['max_depth'],
                                context['current_recursive_depth']
                            )
        
        def function_scope_enter(node, context):
            if node.type == 'function_definition':
                declarator = node.child_by_field_name('declarator')
                if declarator:
                    name_node = next((c for c in declarator.children if c.type == 'identifier'), None)
                    if name_node:
                        function_name = name_node.text.decode('utf8')
                        context['current_function'] = function_name
                        if function_name in self.recursive_functions:
                            context['current_recursive_depth'] = 1
        
        def function_scope_exit(node, context):
            if node.type == 'function_definition':
                context['current_function'] = None
                context['current_recursive_depth'] = 0
        
        def _estimate_type_size(type_name: str) -> int:
            """Estimate the size in bytes of common C++ types"""
            type_sizes = {
                'int': 4,
                'float': 4,
                'double': 8,
                'char': 1,
                'long': 8,
                'bool': 1,
                'short': 2
            }
            
            if '*' in type_name:
                return 8
            
            if 'vector' in type_name or 'list' in type_name or 'map' in type_name:
                if '<' in type_name and '>' in type_name:
                    inner_type = type_name.split('<')[1].split('>')[0]
                    inner_size = _estimate_type_size(inner_type)
                    return inner_size + 24  
                return 24  
            
            for t, size in type_sizes.items():
                if t in type_name:
                    return size
                    
            return 4  
        
        memory_context = {
            'memory_exprs': [], 
            'current_function': None,
            'current_recursive_depth': 0
        }
        
        self.traverse(node, [memory_handler, function_scope_enter], memory_context)
        self.traverse(node, [function_scope_exit], memory_context)
        
        if memory_context['memory_exprs']:
            base_memory = sum(memory_context['memory_exprs'])
        else:
            base_memory = sp.Integer(0)
        
        stack_usage = sp.Integer(0)
        for func_name, info in recursive_stack_info.items():
            max_depth = self._analyze_recursive_stack_depth(func_name)
            if max_depth == 'linear':
                depth_expr = self.n
            elif max_depth == 'log':
                depth_expr = sp.log(self.n)
            elif max_depth == 'exponential':
                depth_expr = 2 ** self.n
            else:
                depth_expr = max(info['max_depth'], 1)
                
            stack_usage += sp.Integer(info['frame_size']) * depth_expr
        
        return base_memory + stack_usage, recursive_stack_info
    
    def _complexity_compare(self, expr1, expr2):
        """Compare two complexity expressions and return the one with higher asymptotic growth"""
        rank1 = self._complexity_rank(expr1)
        rank2 = self._complexity_rank(expr2)
        return expr1 if rank1 >= rank2 else expr2

    def _complexity_rank(self, expr):
        """Rank expressions by their asymptotic complexity"""
        n = self.n
        expr_str = str(expr)
        
        if "factorial" in expr_str:
            return 100  
        elif "**" in expr_str and str(n) in expr_str:
            try:
                base = float(expr_str.split("**")[0].strip())
                return 90 + base 
            except:
                return 90 
        elif "*log" in expr_str:
            return 60  
        elif str(n) + "**" in expr_str or "**" + str(n) in expr_str:
            try:
                if "**" in expr_str:
                    power = float(expr_str.split("**")[1].strip())
                    return 50 + power  
            except:
                return 55  
        elif str(n) in expr_str:
            return 40  
        elif "log" in expr_str:
            return 20  
        else:
            return 10  
    
    def _analyze_recursive_stack_depth(self, function_name: str) -> Union[str, int]:
        function_node = self.function_definitions.get(function_name)
        if not function_node:
            return 1        
        if self._has_divide_and_conquer_pattern(function_node, function_name):
            return 'log'
            
        if self._has_exponential_pattern(function_node, function_name):
            return 'exponential'
            
        return 'linear'
    
    def _has_divide_and_conquer_pattern(self, node, function_name: str) -> bool:
        """Check if the function has a divide-and-conquer pattern (like binary search)"""
        def check_for_division(node, context):
            if node.type == 'binary_expression':
                text = node.text.decode('utf8')
                if '/' in text or '>>' in text or 'mid' in text:
                    context['has_division'] = True
        
        division_context = {'has_division': False}
        self.traverse(node, [check_for_division], division_context)
        
        def count_recursive_calls(node, context):
            if node.type == 'call_expression':
                function_node = node.child_by_field_name('function')
                if function_node and function_node.text.decode('utf8') == function_name:
                    context['call_count'] += 1
        
        call_context = {'call_count': 0}
        self.traverse(node, [count_recursive_calls], call_context)
        
        return division_context['has_division'] and 1 <= call_context['call_count'] <= 2
    
    def _has_exponential_pattern(self, node, function_name: str) -> bool:
        """Check if the function has an exponential pattern (like Fibonacci)"""
        def count_recursive_calls(node, context):
            if node.type == 'call_expression':
                function_node = node.child_by_field_name('function')
                if function_node and function_node.text.decode('utf8') == function_name:
                    context['call_count'] += 1
        
        call_context = {'call_count': 0}
        self.traverse(node, [count_recursive_calls], call_context)
        
        return call_context['call_count'] >= 2
        
    def get_recursion_info(self) -> Dict[str, Any]:
        """Get information about detected recursive functions"""
        result = {
            'recursive_functions': list(self.recursive_functions),
            'function_count': len(self.function_definitions),
            'recursive_count': len(self.recursive_functions)
        }
        
        result['complexity_by_function'] = {}
        for func_name in self.recursive_functions:
            stack_depth = self._analyze_recursive_stack_depth(func_name)
            if stack_depth == 'linear':
                time_complexity = "O(n)"
                space_complexity = "O(n)"
            elif stack_depth == 'log':
                time_complexity = "O(log n)"
                space_complexity = "O(log n)"
            elif stack_depth == 'exponential':
                time_complexity = "O(2^n)"
                space_complexity = "O(n)" 
            else:
                time_complexity = f"O(n^{stack_depth})" if stack_depth > 1 else "O(n)"
                space_complexity = f"O({stack_depth})"
                
            result['complexity_by_function'][func_name] = {
                'time_complexity': time_complexity,
                'space_complexity': space_complexity,
                'pattern': stack_depth
            }
            
        return result

if __name__ == '__main__':
    codeParser = CodeParser()
    code = """ 
       // C++ Program for Space Optimized Dynamic Programming
// Solution to Subset Sum Problem
#include <bits/stdc++.h>
using namespace std;

// Returns true if there is a subset of arr[]
// with sum equal to given sum
bool isSubsetSum(vector<int> arr, int sum) {
    int n = arr.size();
    vector<bool> prev(sum + 1, false), curr(sum + 1);

    // Mark prev[0] = true as it is true
      // to make sum = 0 using 0 elements
    prev[0] = true;

    // Fill the subset table in
      // bottom up manner
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= sum; j++) {
            if (j < arr[i - 1])
                curr[j] = prev[j];
            else
                curr[j] = (prev[j] || prev[j - arr[i - 1]]);
        }
        prev = curr;
    }
    return prev[sum];
}

int main() {
    vector<int> arr = {3, 34, 4, 12, 5, 2};
    int sum = 9;
    if (isSubsetSum(arr, sum) == true)
        cout << "True";
    else
        cout << "False";
    return 0;
}

  """
    tree = codeParser.evaluate_code_syntax(code)
    errors = codeParser.find_error_nodes(tree.root_node)
    
    if errors:
        print(f"\nSyntax Errors: {len(errors)}")
    else:
        print("\nNo syntax errors detected.")
    
    codeParser.identify_functions_and_recursion(tree.root_node)
    recursion_info = codeParser.get_recursion_info()
    
    if recursion_info['recursive_count'] > 0:
        print(f"\nDetected {recursion_info['recursive_count']} recursive functions:")
        for func_name, info in recursion_info['complexity_by_function'].items():
            print(f"  - {func_name}: {info['time_complexity']} time, {info['space_complexity']} space")
    else:
        print("\nNo recursive functions detected.")
    
    time_complexity = codeParser.analyze_time_complexity(tree.root_node)
    memory_usage, stack_info = codeParser.analyze_memory_usage(tree.root_node)
    
    print(f"\nTime Complexity Expression: {time_complexity}")
    print(f"Time Complexity (Big-O): O({sp.simplify(time_complexity)})")
    
    print(f"\nMemory Usage Expression: {memory_usage} bytes")
    print(f"Memory Usage (Big-O): O({sp.simplify(memory_usage)}) bytes")
    
    codeParser.print_tree(tree)