<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'bintang_sell';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$segments = explode('/', trim($path, '/'));

// Remove 'api.php' from segments if present
if (end($segments) === 'api.php') {
    array_pop($segments);
}

$endpoint = isset($segments[0]) ? $segments[0] : '';
$id = isset($segments[1]) ? $segments[1] : null;

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

switch ($endpoint) {
    case 'products':
        handleProducts($method, $id, $input, $pdo);
        break;
    
    case 'users':
        handleUsers($method, $id, $input, $pdo);
        break;
    
    case 'orders':
        handleOrders($method, $id, $input, $pdo);
        break;
    
    case 'auth':
        handleAuth($method, $input, $pdo);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

// Products handler
function handleProducts($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single product
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$id]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($product) {
                    echo json_encode($product);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                }
            } else {
                // Get all products with optional filters
                $category = $_GET['category'] ?? null;
                $search = $_GET['search'] ?? null;
                
                $sql = "SELECT * FROM products WHERE 1=1";
                $params = [];
                
                if ($category && $category !== 'All') {
                    $sql .= " AND category = ?";
                    $params[] = $category;
                }
                
                if ($search) {
                    $sql .= " AND (name LIKE ? OR category LIKE ?)";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                }
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($products);
            }
            break;
        
        case 'POST':
            // Create new product (admin only)
            $stmt = $pdo->prepare("
                INSERT INTO products (name, price, original_price, image, category, rating, reviews, in_stock, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $input['name'],
                $input['price'],
                $input['original_price'] ?? null,
                $input['image'],
                $input['category'],
                $input['rating'] ?? 0,
                $input['reviews'] ?? 0,
                $input['in_stock'] ?? true,
                $input['description'] ?? ''
            ]);
            
            if ($result) {
                echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Product created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create product']);
            }
            break;
        
        case 'PUT':
            // Update product
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("
                UPDATE products 
                SET name = ?, price = ?, original_price = ?, image = ?, category = ?, 
                    rating = ?, reviews = ?, in_stock = ?, description = ?
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                $input['name'],
                $input['price'],
                $input['original_price'] ?? null,
                $input['image'],
                $input['category'],
                $input['rating'],
                $input['reviews'],
                $input['in_stock'],
                $input['description'],
                $id
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Product updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update product']);
            }
            break;
        
        case 'DELETE':
            // Delete product
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['message' => 'Product deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete product']);
            }
            break;
    }
}

// Users handler
function handleUsers($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT id, name, email, created_at FROM users WHERE id = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    echo json_encode($user);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                }
            } else {
                // Get all users (admin only)
                $stmt = $pdo->query("SELECT id, name, email, created_at FROM users");
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($users);
            }
            break;
        
        case 'POST':
            // Register new user
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists']);
                return;
            }
            
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
            $result = $stmt->execute([$input['name'], $input['email'], $hashedPassword]);
            
            if ($result) {
                $userId = $pdo->lastInsertId();
                echo json_encode(['id' => $userId, 'message' => 'User registered successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to register user']);
            }
            break;
    }
}

// Orders handler
function handleOrders($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single order
                $stmt = $pdo->prepare("
                    SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image as product_image
                    FROM orders o 
                    LEFT JOIN order_items oi ON o.id = oi.order_id 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE o.id = ?
                ");
                $stmt->execute([$id]);
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (empty($results)) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Order not found']);
                    return;
                }
                
                $order = [
                    'id' => $results[0]['id'],
                    'user_id' => $results[0]['user_id'],
                    'order_id' => $results[0]['order_id'],
                    'total' => $results[0]['total'],
                    'status' => $results[0]['status'],
                    'tracking_number' => $results[0]['tracking_number'],
                    'shipping_info' => json_decode($results[0]['shipping_info'], true),
                    'created_at' => $results[0]['created_at'],
                    'items' => []
                ];
                
                foreach ($results as $row) {
                    if ($row['product_id']) {
                        $order['items'][] = [
                            'product_id' => $row['product_id'],
                            'name' => $row['product_name'],
                            'image' => $row['product_image'],
                            'quantity' => $row['quantity'],
                            'price' => $row['price']
                        ];
                    }
                }
                
                echo json_encode($order);
            } else {
                // Get orders for user
                $userId = $_GET['user_id'] ?? null;
                if (!$userId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                    return;
                }
                
                $stmt = $pdo->prepare("
                    SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image as product_image
                    FROM orders o 
                    LEFT JOIN order_items oi ON o.id = oi.order_id 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE o.user_id = ? 
                    ORDER BY o.created_at DESC
                ");
                $stmt->execute([$userId]);
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $orders = [];
                $currentOrderId = null;
                $currentOrder = null;
                
                foreach ($results as $row) {
                    if ($row['id'] !== $currentOrderId) {
                        if ($currentOrder) {
                            $orders[] = $currentOrder;
                        }
                        
                        $currentOrderId = $row['id'];
                        $currentOrder = [
                            'id' => $row['id'],
                            'order_id' => $row['order_id'],
                            'total' => $row['total'],
                            'status' => $row['status'],
                            'tracking_number' => $row['tracking_number'],
                            'shipping_info' => json_decode($row['shipping_info'], true),
                            'created_at' => $row['created_at'],
                            'items' => []
                        ];
                    }
                    
                    if ($row['product_id']) {
                        $currentOrder['items'][] = [
                            'product_id' => $row['product_id'],
                            'name' => $row['product_name'],
                            'image' => $row['product_image'],
                            'quantity' => $row['quantity'],
                            'price' => $row['price']
                        ];
                    }
                }
                
                if ($currentOrder) {
                    $orders[] = $currentOrder;
                }
                
                echo json_encode($orders);
            }
            break;
        
        case 'POST':
            // Create new order
            try {
                $pdo->beginTransaction();
                
                // Generate order ID and tracking number
                $orderId = 'BS' . time();
                $trackingNumber = 'TRK' . strtoupper(substr(md5(uniqid()), 0, 9));
                
                // Insert order
                $stmt = $pdo->prepare("
                    INSERT INTO orders (user_id, order_id, total, status, tracking_number, shipping_info) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $input['user_id'],
                    $orderId,
                    $input['total'],
                    'pending',
                    $trackingNumber,
                    json_encode($input['shipping_info'])
                ]);
                
                $orderDbId = $pdo->lastInsertId();
                
                // Insert order items
                $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                
                foreach ($input['items'] as $item) {
                    $stmt->execute([
                        $orderDbId,
                        $item['product_id'],
                        $item['quantity'],
                        $item['price']
                    ]);
                }
                
                $pdo->commit();
                
                echo json_encode([
                    'id' => $orderDbId,
                    'order_id' => $orderId,
                    'tracking_number' => $trackingNumber,
                    'message' => 'Order created successfully'
                ]);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create order: ' . $e->getMessage()]);
            }
            break;
        
        case 'PUT':
            // Update order status
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Order ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $result = $stmt->execute([$input['status'], $id]);
            
            if ($result) {
                echo json_encode(['message' => 'Order status updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update order status']);
            }
            break;
    }
}

// Authentication handler
function handleAuth($method, $input, $pdo) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'login':
            $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($input['password'], $user['password'])) {
                // In a real application, you would generate a JWT token here
                unset($user['password']);
                echo json_encode([
                    'success' => true,
                    'user' => $user,
                    'message' => 'Login successful'
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }
            break;
        
        case 'register':
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists']);
                return;
            }
            
            // Create new user
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
            $result = $stmt->execute([$input['name'], $input['email'], $hashedPassword]);
            
            if ($result) {
                $userId = $pdo->lastInsertId();
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $userId,
                        'name' => $input['name'],
                        'email' => $input['email']
                    ],
                    'message' => 'Registration successful'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to register user']);
            }
            break;
        
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
}
?>