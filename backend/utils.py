import itertools

"""
This section contains the core isomorphism-checking logic for IsoQuest. 
It provides: 
- a parser that converts Cytoscape.js graph elements into a python-friendly 
representation (nodes + adjacency lists) 
- a brute-force graph isomorphism checker that tests all possible mappings between the
target and user graphs 
This file contains the actual algorithm used by the game to determine whether the
player's constructed graph is structurally and color-wise identical to the target 
graph. 
"""


# Graph Parsing
def parse_graph(cy_elements):
    """
    Converts Cytoscape.js elements into two python structures:
    nodes: {node_id: colour}
    adjacency: {node_id: set(neighbour_ids) }
    The function performs two passes:
    1. Extract nodes and their colors
    2. Extract edges and build adjacency lists

    Args:
        cy_elements (list): Raw cytoscape elements from JSON or user input.
    Returns:
        (dict, dict: nodes, adjacency
    """
    nodes = {}
    adjacency = {}

    # First pass: collect nodes and colors
    for el in cy_elements:
        if el["data"].get("id") and not el["data"].get("source"):
            node_id = el["data"]["id"]
            colour = el["data"].get("colour", "#ffffff")  # default white
            nodes[node_id] = colour
            adjacency[node_id] = set()

    # Second pass: collect edges
    for el in cy_elements:
        if el["data"].get("source"):
            s = el["data"]["source"]
            t = el["data"]["target"]
            adjacency[s].add(t)
            adjacency[t].add(s)

    return nodes, adjacency


# Graph Isomorphism Checker
def graphs_match(target, user):
    """
    Determines whether the user's graph is isomorphic to the target graph
    The algorithm checks:
    1. Node count equality
    2. All possible mappings between target and user nodes
    3. Color consistency under each mapping
    4. Degree (number of neighbours) consistency
    5. Adjacency structure consistency
    This is a brute-force isomorphism check using permutations

    Args:
        target (list): cytoscape elements for the target graph
        user (list): cytoscape elements for the user's graph

    Returns:
        (bool, dict or None):
        - True + mapping if graphs are isomorphic
        - False + None otherwise
    """
    # Parse both graphs into comparable structures
    target_nodes, target_adj = parse_graph(target)
    user_nodes, user_adj = parse_graph(user)

    # 1. Node count must match
    if len(target_nodes) != len(user_nodes):
        return False, None

    target_ids = list(target_nodes.keys())
    user_ids = list(user_nodes.keys())

    # Try every possible mapping from target and user
    for perm in itertools.permutations(user_ids):
        mapping = dict(zip(target_ids, perm))

        # 2. Color check under mapping
        colours_ok = all(
            target_nodes[t].lower() == user_nodes[mapping[t]].lower()
            for t in target_ids
        )
        if not colours_ok:
            continue

        # 3. Degree check under mapping
        degrees_ok = all(
            len(target_adj[t]) == len(user_adj[mapping[t]])
            for t in target_ids
        )
        if not degrees_ok:
            continue

        # 4. Adjacency check under mapping
        adjacency_ok = True
        for t in target_ids:
            mapped_neighbours = {mapping[n] for n in target_adj[t]}
            if mapped_neighbours != user_adj[mapping[t]]:
                adjacency_ok = False
                break

        # If all checks passed, graphs are isomorphic
        if adjacency_ok:
            return True, mapping
    # No valid mapping found
    return False, None
