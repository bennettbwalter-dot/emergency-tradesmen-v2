def get_pagination_window(currentPage, totalPages):
    maxVisible = 5
    start = max(1, currentPage - 2)
    end = start + maxVisible - 1

    if end > totalPages:
        end = totalPages
        start = max(1, end - maxVisible + 1)
    
    return list(range(start, end + 1))

# Test Cases
test_cases = [
    (1, 10),  # Start
    (2, 10),
    (3, 10),
    (5, 10),  # Middle
    (8, 10),
    (9, 10),
    (10, 10), # End
    (1, 3),   # Small total
    (2, 3),
    (3, 3)
]

for curr, total in test_cases:
    window = get_pagination_window(curr, total)
    print(f"Current: {curr}, Total: {total} => Window: {window}")
