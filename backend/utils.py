import itertools

def parse_graph(cy_elements):
    nodes = {}
    adjacency = {}

    # First pass: collect nodes and colors
    for el in cy_elements:
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

    # Node count must match
    if len(target_nodes) != len(user_nodes):
        return False

    target_ids = list(target_nodes.keys())
    user_ids = list(user_nodes.keys())

    # Try every possible mapping from target → user
    for perm in itertools.permutations(user_ids):
        mapping = dict(zip(target_ids, perm))

        # 1. Color check under mapping
        colours_ok = all(
            target_nodes[t].lower() == user_nodes[mapping[t]].lower()
            for t in target_ids
        )
        if not colours_ok:
            continue

        # 2. Degree check under mapping
        degrees_ok = all(
            len(target_adj[t]) == len(user_adj[mapping[t]])
            for t in target_ids
        )
        if not degrees_ok:
            continue

        # 3. Adjacency check under mapping
        adjacency_ok = True
        for t in target_ids:
            mapped_neighbours = {mapping[n] for n in target_adj[t]}
            if mapped_neighbours != user_adj[mapping[t]]:
                adjacency_ok = False
                break

        if adjacency_ok:
            return True

    return False



