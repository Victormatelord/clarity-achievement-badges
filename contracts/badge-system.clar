;; Digital Badge Achievement System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-badge-exists (err u101))
(define-constant err-badge-not-found (err u102))
(define-constant err-not-eligible (err u103))

;; Data Variables
(define-map badges
    { badge-id: uint }
    {
        name: (string-ascii 50),
        description: (string-ascii 200),
        criteria: (string-ascii 200),
        points: uint
    }
)

(define-map user-badges
    { user: principal, badge-id: uint }
    {
        awarded-at: uint,
        verified: bool
    }
)

;; Create new badge type - owner only
(define-public (create-badge (badge-id uint) (name (string-ascii 50)) (description (string-ascii 200)) (criteria (string-ascii 200)) (points uint))
    (if (is-eq tx-sender contract-owner)
        (if (is-none (map-get? badges {badge-id: badge-id}))
            (begin
                (map-set badges 
                    {badge-id: badge-id}
                    {
                        name: name,
                        description: description,
                        criteria: criteria,
                        points: points
                    }
                )
                (ok true)
            )
            err-badge-exists
        )
        err-owner-only
    )
)

;; Award badge to user - owner only
(define-public (award-badge (user principal) (badge-id uint))
    (if (is-eq tx-sender contract-owner)
        (if (is-some (map-get? badges {badge-id: badge-id}))
            (begin
                (map-set user-badges
                    {user: user, badge-id: badge-id}
                    {
                        awarded-at: block-height,
                        verified: true
                    }
                )
                (ok true)
            )
            err-badge-not-found
        )
        err-owner-only
    )
)

;; Read-only functions
(define-read-only (get-badge-info (badge-id uint))
    (ok (map-get? badges {badge-id: badge-id}))
)

(define-read-only (has-badge (user principal) (badge-id uint))
    (ok (is-some (map-get? user-badges {user: user, badge-id: badge-id})))
)

(define-read-only (get-user-badges (user principal))
    (ok (map-get? user-badges {user: user, badge-id: badge-id}))
)
