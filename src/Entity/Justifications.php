<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\JustificationsRepository;
use App\Utils\TimeTampTrait;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\HasLifecycleCallbacks;

#[ORM\Entity(repositoryClass: JustificationsRepository::class)]
#[ApiResource(
    operations: [
        new Post(),
        new GetCollection(
            uriTemplate: '/justifications/all',
            paginationEnabled: false,
        ),

        new Get(),
        new Patch(),
        new Delete(),
    ],
)]
#[HasLifecycleCallbacks]
class Justifications
{
    use TimeTampTrait;
    
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'justifications')]
    private ?Presence $presences = null;

    #[ORM\ManyToOne(inversedBy: 'justifications')]
    private ?Etudiant $etudiants = null;

    #[ORM\Column(length: 255)]
    private ?string $motif = null;

    #[ORM\Column(length: 255)]
    private ?string $documentJustificatif = null;

    #[ORM\Column(length: 255)]
    private ?string $statut = null;

    #[ORM\Column]
    private ?\DateTime $dateDepot = null;

    #[ORM\Column]
    private ?\DateTime $dateTraitement = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPresences(): ?Presence
    {
        return $this->presences;
    }

    public function setPresences(?Presence $presences): static
    {
        $this->presences = $presences;

        return $this;
    }

    public function getEtudiants(): ?Etudiant
    {
        return $this->etudiants;
    }

    public function setEtudiants(?Etudiant $etudiants): static
    {
        $this->etudiants = $etudiants;

        return $this;
    }

    public function getMotif(): ?string
    {
        return $this->motif;
    }

    public function setMotif(string $motif): static
    {
        $this->motif = $motif;

        return $this;
    }

    public function getDocumentJustificatif(): ?string
    {
        return $this->documentJustificatif;
    }

    public function setDocumentJustificatif(string $documentJustificatif): static
    {
        $this->documentJustificatif = $documentJustificatif;

        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getDateDepot(): ?\DateTime
    {
        return $this->dateDepot;
    }

    public function setDateDepot(\DateTime $dateDepot): static
    {
        $this->dateDepot = $dateDepot;

        return $this;
    }

    public function getDateTraitement(): ?\DateTime
    {
        return $this->dateTraitement;
    }

    public function setDateTraitement(\DateTime $dateTraitement): static
    {
        $this->dateTraitement = $dateTraitement;

        return $this;
    }
}
