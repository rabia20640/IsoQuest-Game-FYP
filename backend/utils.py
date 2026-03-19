def parse_graph(cy_elements):
    nodes = {}
    adjacency = {}

    # First pass: collect nodes and colors
    for el in cy_elements:
        # Node elements have "id" but no "source"
        if el["data"].get("id") and not el["data"].get("source"):
            node_id = el["data"]["id"]
            colour = el["data"].get("colour", "#ffffff")
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


def graphs_match(target, user):
    target_nodes, target_adj = parse_graph(target)
    user_nodes, user_adj = parse_graph(user)

    # 1. Node count
    if len(target_nodes) != len(user_nodes):
        return False

    # 2. Colour check
    for node in target_nodes:
        if target_nodes[node] != user_nodes.get(node):
            return False

    # 3. Degree check
    for node in target_adj:
        if len(target_adj[node]) != len(user_adj.get(node, [])):
            return False

    # 4. Adjacency check
    for node in target_adj:
        if target_adj[node] != user_adj.get(node, set()):
            return False

    return True

