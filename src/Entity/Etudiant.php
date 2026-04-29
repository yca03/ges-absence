<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\EtudiantRepository;
use App\Utils\TimeTampTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EtudiantRepository::class)]
#[ApiResource(
    operations: [
        new Post(),
        new GetCollection(
            uriTemplate: '/etudiants/all',
            paginationEnabled: false,
        ),

        new Get(),
        new Patch(),
        new Delete(),
    ],
)]
#[ORM\HasLifecycleCallbacks]
class Etudiant
{
     use TimeTampTrait;
     
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $prenom = null;

    #[ORM\Column(length: 255)]
    private ?string $sexe = null;

    #[ORM\ManyToOne(inversedBy: 'etudiants')]
    private ?Filiere $filieres = null;

    /**
     * @var Collection<int, Enseignement>
     */
    #[ORM\ManyToMany(targetEntity: Enseignement::class, mappedBy: 'etudiant')]
    private Collection $enseignements;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $telephone = null;

    #[ORM\ManyToOne(inversedBy: 'etudiants')]
    private ?Presence $presence = null;

    /**
     * @var Collection<int, Justifications>
     */
    #[ORM\OneToMany(targetEntity: Justifications::class, mappedBy: 'etudiants')]
    private Collection $justifications;

    public function __construct()
    {
        $this->enseignements = new ArrayCollection();
        $this->justifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getSexe(): ?string
    {
        return $this->sexe;
    }

    public function setSexe(string $sexe): static
    {
        $this->sexe = $sexe;

        return $this;
    }

    public function getFilieres(): ?Filiere
    {
        return $this->filieres;
    }

    public function setFilieres(?Filiere $filieres): static
    {
        $this->filieres = $filieres;

        return $this;
    }

    /**
     * @return Collection<int, Enseignement>
     */
    public function getEnseignements(): Collection
    {
        return $this->enseignements;
    }

    public function addEnseignement(Enseignement $enseignement): static
    {
        if (!$this->enseignements->contains($enseignement)) {
            $this->enseignements->add($enseignement);
            $enseignement->addEtudiant($this);
        }

        return $this;
    }

    public function removeEnseignement(Enseignement $enseignement): static
    {
        if ($this->enseignements->removeElement($enseignement)) {
            $enseignement->removeEtudiant($this);
        }

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getPresence(): ?Presence
    {
        return $this->presence;
    }

    public function setPresence(?Presence $presence): static
    {
        $this->presence = $presence;

        return $this;
    }

    /**
     * @return Collection<int, Justifications>
     */
    public function getJustifications(): Collection
    {
        return $this->justifications;
    }

    public function addJustification(Justifications $justification): static
    {
        if (!$this->justifications->contains($justification)) {
            $this->justifications->add($justification);
            $justification->setEtudiants($this);
        }

        return $this;
    }

    public function removeJustification(Justifications $justification): static
    {
        if ($this->justifications->removeElement($justification)) {
            // set the owning side to null (unless already changed)
            if ($justification->getEtudiants() === $this) {
                $justification->setEtudiants(null);
            }
        }

        return $this;
    }
}
